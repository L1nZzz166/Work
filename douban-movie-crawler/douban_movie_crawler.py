# -*- coding: utf-8 -*-
"""
豆瓣电影爬虫
------------
抓取任意 100 部电影的详情字段，输出 CSV，并统计运行耗时。

数据来源（公开 JSON 接口，避免解析被反爬拦截的 HTML）：
  - 列表: https://movie.douban.com/j/search_subjects
  - 详情: https://m.douban.com/rexxar/api/v2/subject/{id}
  - 演职: https://m.douban.com/rexxar/api/v2/subject/{id}/credits
"""
import csv
import json
import os
import random
import time
from pathlib import Path
from urllib.parse import urlencode

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

TARGET = 100
TIMEOUT = 20
MIN_DELAY = 1.6          # 成功请求后的最小间隔（秒）
MAX_DELAY = 3.2          # 成功请求后的最大间隔（秒）
BACKOFF_BASE = 4.0       # 被限流/失败时的指数退避基数
BACKOFF_MAX = 90.0       # 退避上限（秒）
MAX_RETRIES = 6
LIST_PAGE_SIZE = 50

LIST_TAG = "豆瓣高分"
LIST_SORT = "rank"
LIST_URL = "https://movie.douban.com/j/search_subjects"
DETAIL_URL = "https://m.douban.com/rexxar/api/v2/subject/{movie_id}"
CREDITS_URL = "https://m.douban.com/rexxar/api/v2/subject/{movie_id}/credits"

OUTPUT_CSV = "douban_movies.csv"
CHECKPOINT = "checkpoint.json"

CSV_FIELDS = [
    "电影名称",
    "封面链接",
    "导演",
    "编剧",
    "主演",
    "类型",
    "制片国家/地区",
    "语言",
    "上映日期",
    "片长",
    "豆瓣评分",
    "评价人数",
]

# 轮换 User-Agent，降低单一指纹被识别的概率
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:129.0) Gecko/20100101 Firefox/129.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36",
]

ACCEPT_LANGUAGES = [
    "zh-CN,zh;q=0.9,en;q=0.8",
    "zh-CN,zh;q=0.8,en-US;q=0.6,en;q=0.4",
    "zh-CN,zh;q=0.9",
]


def join_names(items, key="name", limit=None):
    """把接口返回的对象列表拼成「 / 」分隔字符串。"""
    if not items:
        return ""
    names = []
    for item in items:
        if isinstance(item, dict):
            name = (item.get(key) or "").strip()
        else:
            name = str(item).strip()
        if name:
            names.append(name)
        if limit and len(names) >= limit:
            break
    return " / ".join(names)


def join_text(items, limit=None):
    if not items:
        return ""
    values = [str(x).strip() for x in items if str(x).strip()]
    if limit:
        values = values[:limit]
    return " / ".join(values)


WRITER_HINTS = ("编剧", "剧本", "原著", "Writer", "Screenplay", "Screen Play", "Author")


def extract_writers(credits):
    """从 credits.items 中筛选编剧 / 剧本 / Screenplay 等写作人员。"""
    names = []
    seen = set()
    for item in credits.get("items") or []:
        character = item.get("character") or ""
        name = (item.get("name") or "").strip()
        if not name:
            continue
        lowered = character.lower()
        matched = any(hint.lower() in lowered for hint in WRITER_HINTS)
        if matched and name not in seen:
            seen.add(name)
            names.append(name)
    return " / ".join(names)


def parse_movie(detail, credits):
    """把详情 + 演职人员接口整理成 CSV 一行。"""
    rating = detail.get("rating") or {}
    pic = detail.get("pic") or {}
    cover = (
        detail.get("cover_url")
        or pic.get("large")
        or pic.get("normal")
        or ""
    )
    score = rating.get("value")
    votes = rating.get("count")
    return {
        "电影名称": detail.get("title") or "",
        "封面链接": cover,
        "导演": join_names(detail.get("directors")),
        "编剧": extract_writers(credits),
        "主演": join_names(detail.get("actors"), limit=8),
        "类型": join_text(detail.get("genres")),
        "制片国家/地区": join_text(detail.get("countries")),
        "语言": join_text(detail.get("languages")),
        "上映日期": join_text(detail.get("pubdate")) or (detail.get("year") or ""),
        "片长": join_text(detail.get("durations")),
        "豆瓣评分": "" if score in (None, "") else score,
        "评价人数": "" if votes in (None, "") else votes,
    }


class AntiBanSession:
    """
    防 IP 封禁的通用请求封装：
      1. Session 复用 + 连接池
      2. User-Agent / Accept-Language 轮换
      3. 成功后随机休眠（限速）
      4. 403/418/429/5xx 指数退避 + 抖动
      5. 超时重试
      6. 识别验证码/拦截页
      7. 支持环境变量 HTTP(S)_PROXY（不写死代理 IP）
    """

    RETRY_STATUSES = {400, 403, 418, 429, 500, 502, 503, 504}

    def __init__(self):
        self.session = requests.Session()
        retry = Retry(
            total=0,  # 状态码重试由本类自己做，避免与 urllib3 重复叠加
            connect=2,
            read=2,
            backoff_factor=0.5,
            raise_on_status=False,
        )
        adapter = HTTPAdapter(max_retries=retry, pool_connections=8, pool_maxsize=8)
        self.session.mount("https://", adapter)
        self.session.mount("http://", adapter)
        self.consecutive_fails = 0

        # 通用写法：若本机已配置代理则自动走代理，脚本内不内置代理池
        for key in ("HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy"):
            if os.environ.get(key):
                print(f"检测到代理环境变量 {key}，将通过代理发送请求")
                break

    def _headers(self, referer):
        return {
            "User-Agent": random.choice(USER_AGENTS),
            "Referer": referer,
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": random.choice(ACCEPT_LANGUAGES),
            "Connection": "keep-alive",
        }

    def polite_sleep(self):
        time.sleep(random.uniform(MIN_DELAY, MAX_DELAY))

    def get_json(self, url, referer):
        last_error = None
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                resp = self.session.get(
                    url,
                    headers=self._headers(referer),
                    timeout=TIMEOUT,
                )
                if resp.status_code in self.RETRY_STATUSES:
                    wait = min(BACKOFF_BASE * (2 ** (attempt - 1)), BACKOFF_MAX)
                    wait += random.uniform(0.5, 2.0)
                    extra = ""
                    try:
                        payload = resp.json()
                        msg = payload.get("msg") or payload.get("localized_message") or ""
                        extra = f" {msg}" if msg else ""
                        # 豆瓣 subject_ip_rate_limit：加长冷却，避免继续打同一接口
                        if payload.get("code") == 1309 or "rate_limit" in str(msg):
                            wait = max(wait, random.uniform(25.0, 45.0))
                    except (ValueError, json.JSONDecodeError):
                        pass
                    print(
                        f"  [防封禁] HTTP {resp.status_code}{extra}，"
                        f"第 {attempt}/{MAX_RETRIES} 次，休眠 {wait:.1f}s"
                    )
                    time.sleep(wait)
                    last_error = RuntimeError(f"HTTP {resp.status_code}{extra}")
                    continue

                resp.raise_for_status()
                text = (resp.text or "").strip()
                if not text.startswith(("{", "[")):
                    wait = min(BACKOFF_BASE * (2 ** (attempt - 1)), BACKOFF_MAX)
                    print(
                        f"  [防封禁] 非 JSON 响应（可能触发验证码），"
                        f"第 {attempt}/{MAX_RETRIES} 次，休眠 {wait:.1f}s"
                    )
                    time.sleep(wait)
                    last_error = RuntimeError("non-json response")
                    continue

                self.consecutive_fails = 0
                return resp.json()

            except (requests.RequestException, ValueError, json.JSONDecodeError) as exc:
                last_error = exc
                wait = min(BACKOFF_BASE * (2 ** (attempt - 1)), BACKOFF_MAX)
                wait += random.uniform(0.3, 1.2)
                print(
                    f"  [防封禁] 请求异常 {type(exc).__name__}: {exc}，"
                    f"第 {attempt}/{MAX_RETRIES} 次，休眠 {wait:.1f}s"
                )
                time.sleep(wait)

        self.consecutive_fails += 1
        if self.consecutive_fails >= 8:
            raise RuntimeError("连续失败次数过多，已停止以免触发更严格封禁")
        raise RuntimeError(f"请求失败: {url} -> {last_error}")


def load_checkpoint():
    path = Path(CHECKPOINT)
    if not path.exists():
        return [], 0.0
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        rows = data.get("rows") or []
        elapsed = float(data.get("elapsed_seconds") or 0)
        print(f"读取断点 {CHECKPOINT}，已有 {len(rows)} 条，累计耗时 {elapsed:.2f}s")
        return rows, elapsed
    except (OSError, ValueError):
        return [], 0.0


def save_checkpoint(rows, elapsed_seconds):
    payload = {
        "count": len(rows),
        "elapsed_seconds": round(elapsed_seconds, 2),
        "rows": rows,
    }
    Path(CHECKPOINT).write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def merge_row(old, new):
    """只覆盖非空字段，避免一次失败把已抓到的数据写空。"""
    merged = dict(old)
    for key, value in new.items():
        if str(value).strip():
            merged[key] = value
    return merged


def row_needs_repair(row):
    """导演、评分缺失视为详情失败；编剧缺失则补抓演职人员。"""
    if not str(row.get("导演") or "").strip():
        return True
    if row.get("豆瓣评分") in ("", None):
        return True
    if not str(row.get("编剧") or "").strip():
        return True
    return False
    """导演、评分缺失视为详情失败；编剧缺失则补抓演职人员。"""
    if not str(row.get("导演") or "").strip():
        return True
    if row.get("豆瓣评分") in ("", None):
        return True
    if not str(row.get("编剧") or "").strip():
        return True
    return False


def fetch_one_movie(client, movie_id):
    referer = f"https://m.douban.com/movie/subject/{movie_id}/"
    detail = client.get_json(DETAIL_URL.format(movie_id=movie_id), referer=referer)
    client.polite_sleep()
    try:
        credits = client.get_json(CREDITS_URL.format(movie_id=movie_id), referer=referer)
    except RuntimeError as exc:
        print(f"    演职人员接口失败，先保存详情: {exc}")
        credits = {"items": []}
    client.polite_sleep()
    return parse_movie(detail, credits)


def write_csv(rows):
    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_FIELDS)
        writer.writeheader()
        writer.writerows(rows)


def fetch_movie_ids(client, need):
    """分页拉取电影 id 列表，直到凑够 need 部（去重）。"""
    movies = []
    seen = set()
    start = 0
    while len(movies) < need:
        params = {
            "type": "movie",
            "tag": LIST_TAG,
            "sort": LIST_SORT,
            "page_limit": LIST_PAGE_SIZE,
            "page_start": start,
        }
        url = f"{LIST_URL}?{urlencode(params)}"
        data = client.get_json(url, referer="https://movie.douban.com/")
        client.polite_sleep()
        subjects = data.get("subjects") or []
        if not subjects:
            break
        for item in subjects:
            movie_id = str(item.get("id") or "")
            if not movie_id or movie_id in seen:
                continue
            seen.add(movie_id)
            movies.append({
                "id": movie_id,
                "title": item.get("title") or "",
            })
            if len(movies) >= need:
                break
        start += LIST_PAGE_SIZE
    return movies


def main():
    started = time.time()
    print(f"目标: 豆瓣「{LIST_TAG}」电影 {TARGET} 部")
    print("防封禁: UA 轮换 / 随机限速 / 指数退避 / 断点续爬 / 可选环境代理")
    print("-" * 60)

    client = AntiBanSession()
    rows, prev_elapsed = load_checkpoint()
    catalog = fetch_movie_ids(client, TARGET + 40)
    title_to_id = {}
    for movie in catalog:
        title_to_id.setdefault(movie["title"], movie["id"])
    print(f"列表接口拿到 {len(catalog)} 部候选")
    print("-" * 60)

    # 先补全已有但字段缺失的记录
    for index, row in enumerate(rows):
        title = row.get("电影名称") or ""
        if not row_needs_repair(row):
            continue
        movie_id = title_to_id.get(title)
        if not movie_id:
            print(f"[补全] 找不到 id，跳过 {title}")
            continue
        print(f"[补全 {index + 1}/{len(rows)}] {title} ({movie_id})")
        try:
            filled = fetch_one_movie(client, movie_id)
        except RuntimeError as exc:
            print(f"    补全失败: {exc}")
            time.sleep(random.uniform(8.0, 15.0))
            continue
        if not filled.get("电影名称"):
            filled["电影名称"] = title
        rows[index] = merge_row(row, filled)
        elapsed_now = prev_elapsed + (time.time() - started)
        write_csv(rows)
        save_checkpoint(rows, elapsed_now)
        print(f"    编剧={filled.get('编剧') or '-'}  评分={filled.get('豆瓣评分')}")

    complete_titles = {
        r.get("电影名称") for r in rows if not row_needs_repair(r)
    }
    if len(rows) < TARGET:
        for index, movie in enumerate(catalog, start=1):
            if len([r for r in rows if not row_needs_repair(r)]) >= TARGET:
                break
            title = movie["title"]
            movie_id = movie["id"]
            if title in complete_titles:
                continue
            print(f"[{index}/{len(catalog)}] 抓取 {title} ({movie_id})")
            try:
                row = fetch_one_movie(client, movie_id)
            except RuntimeError as exc:
                print(f"    跳过（接口失败）: {exc}")
                time.sleep(random.uniform(8.0, 15.0))
                continue
            if not row["电影名称"]:
                row["电影名称"] = title
            if not row.get("导演") and row.get("豆瓣评分") in ("", None):
                print("    详情为空，跳过")
                continue
            rows.append(row)
            if not row_needs_repair(row):
                complete_titles.add(row["电影名称"])
            elapsed_now = prev_elapsed + (time.time() - started)
            write_csv(rows)
            save_checkpoint(rows, elapsed_now)
            print(
                f"    评分={row['豆瓣评分']}  人数={row['评价人数']}  "
                f"已保存 {len(rows)}/{TARGET}"
            )

    elapsed = prev_elapsed + (time.time() - started)
    rows = rows[:TARGET]
    write_csv(rows)
    save_checkpoint(rows, elapsed)
    print("-" * 60)
    print(f"完成: 共 {len(rows)} 部，已写入 {OUTPUT_CSV}")
    print(f"总运行耗时: {elapsed:.2f} 秒")
    Path("run_stats.txt").write_text(
        f"电影数量: {len(rows)}\n总运行耗时: {elapsed:.2f} 秒\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
