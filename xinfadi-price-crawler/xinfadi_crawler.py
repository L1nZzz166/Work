# -*- coding: utf-8 -*-
"""
北京新发地农产品价格爬虫（肉禽蛋）
====================================
爬取一级分类「肉禽蛋」下所有二级分类，近三个月（最近 90 天）的价格数据，
每个二级分类输出一张 CSV 文件，并统计运行耗时。

    一级分类：肉禽蛋 (id=1189)
    二级分类：猪肉类(1205)、牛肉类(1206)、羊肉类(1207)、禽蛋类(1208)

接口说明：
  - 获取二级分类:  POST /getChildCat.html  {prodCatid: <一级分类id>}
  - 获取价格数据:  POST /getPriceData.html {limit, current, pubDateStartTime,
                   pubDateEndTime, prodPcatid, prodCatid, prodName}

注意：该接口返回字段命名与页面相反——`prodCat` 实为一级分类，`prodPcat` 实为二级分类。

运行：
    pip install -r requirements.txt
    python xinfadi_crawler.py
"""
import csv
import random
import time
from datetime import date, timedelta

import requests

# ---------------------------------------------------------------------------
# 基础配置
# ---------------------------------------------------------------------------
BASE_URL = "http://www.xinfadi.com.cn"
PARENT_CAT_ID = 1189          # 一级分类：肉禽蛋
PARENT_CAT_NAME = "肉禽蛋"
DAYS_BACK = 90                # 近三个月（最近 90 天）
PAGE_SIZE = 1000              # 每页条数（接口上限约 1000）
TIMEOUT = 30                  # 单次请求超时（秒）

# ---------------------------------------------------------------------------
# 防 IP 封禁通用写法（可复用到任意爬虫）
# ---------------------------------------------------------------------------
# 1) User-Agent 池：每次请求随机选取，降低被识别为爬虫的概率。
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 "
    "(KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) "
    "Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
]

# 2) 随机休眠：两次请求之间随机等待，模拟真人浏览节奏，避免高频访问触发封禁。
DELAY_MIN = 0.8               # 最短休眠（秒）
DELAY_MAX = 2.5               # 最长休眠（秒）

# 3) 失败重试：指数退避 + 随机抖动，避免雪崩式重试二次触发封禁。
MAX_RETRIES = 5               # 单次请求最大重试次数
BACKOFF_BASE = 2.0            # 退避基数（秒），第 n 次重试等待 backoff_base * 2^(n-1) + 抖动
BACKOFF_STATUS = {429, 500, 502, 503, 504}   # 视为“可重试”的 HTTP 状态码


def build_headers():
    """构造一次请求的头信息：随机 User-Agent + 浏览器 Referer。"""
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Referer": f"{BASE_URL}/priceDetail.html",
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "X-Requested-With": "XMLHttpRequest",
        "Connection": "keep-alive",
    }


def random_sleep():
    """请求间隔随机休眠（防封禁核心手段之一）。"""
    time.sleep(random.uniform(DELAY_MIN, DELAY_MAX))


def safe_post(session, path, data):
    """
    带重试与退避的 POST 请求（防封禁核心手段之二）。

    - 网络异常 / 超时：指数退避重试。
    - 429（限流）/ 5xx（服务端错误）：等待后重试，并读取 Retry-After。
    - 每次重试前刷新 User-Agent，模拟“换一个浏览器再来”。
    """
    url = f"{BASE_URL}{path}"
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = session.post(url, data=data, headers=build_headers(),
                                timeout=TIMEOUT)

            # 限流或服务端错误 -> 退避后重试
            if resp.status_code in BACKOFF_STATUS:
                retry_after = resp.headers.get("Retry-After")
                wait = float(retry_after) if retry_after else \
                    BACKOFF_BASE * (2 ** (attempt - 1)) + random.uniform(0, 1)
                print(f"    [重试] {path} 返回 {resp.status_code}，"
                      f"第 {attempt} 次重试前等待 {wait:.2f}s")
                time.sleep(wait)
                continue

            resp.raise_for_status()   # 其它 4xx 直接抛出
            return resp

        except (requests.ConnectionError, requests.Timeout) as exc:
            wait = BACKOFF_BASE * (2 ** (attempt - 1)) + random.uniform(0, 1)
            print(f"    [重试] {path} {exc.__class__.__name__}，"
                  f"第 {attempt} 次重试前等待 {wait:.2f}s")
            if attempt == MAX_RETRIES:
                raise
            time.sleep(wait)

    raise RuntimeError(f"请求失败（已达最大重试次数）: {url}")
# ---------------------------------------------------------------------------


def get_child_categories(session, parent_id):
    """获取一级分类下的所有二级分类，返回 [(id, 名称), ...]。"""
    random_sleep()
    resp = safe_post(session, "/getChildCat.html", {"prodCatid": parent_id})
    cats = resp.json()
    return [(c["id"], c["names"]) for c in cats if c.get("parentId") == parent_id]


def fetch_prices(session, prod_cat_id, start, end):
    """分页拉取某二级分类在 [start, end] 时间范围内的全部价格记录。"""
    records = []
    current = 1
    while True:
        random_sleep()
        params = {
            "limit": PAGE_SIZE,
            "current": current,
            "pubDateStartTime": start,
            "pubDateEndTime": end,
            "prodPcatid": PARENT_CAT_ID,
            "prodCatid": prod_cat_id,
            "prodName": "",
        }
        resp = safe_post(session, "/getPriceData.html", params)
        data = resp.json()

        total = data.get("count", 0)
        page = data.get("list", [])
        records.extend(page)

        if not page or len(records) >= total:
            break
        current += 1
    return records


CSV_FIELDS = ["一级分类", "二级分类", "品名", "最低价", "最高价",
              "平均价", "单位", "产地", "规格", "日期"]


def write_csv(records, cat_name):
    """把记录写入以二级分类命名的 CSV 文件（UTF-8-SIG，Excel 可直接打开）。"""
    filename = f"{cat_name}.csv"
    with open(filename, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow(CSV_FIELDS)
        for r in records:
            pub_date = (r.get("pubDate") or "")[:10]
            # 字段命名相反：prodCat 是一级分类，prodPcat 才是二级分类
            writer.writerow([
                r.get("prodCat") or PARENT_CAT_NAME,   # 一级分类
                r.get("prodPcat") or cat_name,         # 二级分类
                r.get("prodName") or "",
                r.get("lowPrice") or "",
                r.get("highPrice") or "",
                r.get("avgPrice") or "",
                r.get("unitInfo") or "",
                r.get("place") or "",
                r.get("specInfo") or "",
                pub_date,
            ])
    return filename


def main():
    start_time = time.time()

    end_date = date.today()
    start_date = end_date - timedelta(days=DAYS_BACK)
    start = start_date.strftime("%Y/%m/%d")
    end = end_date.strftime("%Y/%m/%d")

    print(f"目标: 一级分类「{PARENT_CAT_NAME}」(id={PARENT_CAT_ID})")
    print(f"时间范围: {start} ~ {end} (近 {DAYS_BACK} 天)")
    print("-" * 60)

    session = requests.Session()          # 复用连接（keep-alive），减少握手开销
    session.headers.update(build_headers())

    categories = get_child_categories(session, PARENT_CAT_ID)
    print(f"发现 {len(categories)} 个二级分类: "
          f"{', '.join(name for _, name in categories)}")
    print("-" * 60)

    total_records = 0
    for cat_id, cat_name in categories:
        t0 = time.time()
        records = fetch_prices(session, cat_id, start, end)
        filename = write_csv(records, cat_name)
        elapsed = time.time() - t0
        total_records += len(records)
        print(f"[{cat_name}] 记录数={len(records):>5}  耗时={elapsed:.2f}s  "
              f"-> {filename}")

    print("-" * 60)
    total_elapsed = time.time() - start_time
    print(f"共 {len(categories)} 个二级分类, 合计 {total_records} 条记录")
    print(f"总运行耗时: {total_elapsed:.2f} 秒")


if __name__ == "__main__":
    main()
