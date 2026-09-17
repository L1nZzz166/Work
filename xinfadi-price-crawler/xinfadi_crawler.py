# -*- coding: utf-8 -*-
"""
北京新发地农产品价格爬虫
--------------------------
爬取一级分类「肉禽蛋」下所有二级分类，近三个月的价格数据，
每个二级分类输出一张 CSV 文件，并统计运行耗时。

接口说明：
  - 获取二级分类:  POST /getChildCat.html  {prodCatid: <一级分类id>}
  - 获取价格数据:  POST /getPriceData.html {limit, current, pubDateStartTime,
                   pubDateEndTime, prodPcatid, prodCatid, prodName}
"""
import csv
import time
from datetime import date, timedelta

import requests

BASE_URL = "http://www.xinfadi.com.cn"
PARENT_CAT_ID = 1189          # 一级分类：肉禽蛋
PARENT_CAT_NAME = "肉禽蛋"
DAYS_BACK = 90                # 近三个月（最近 90 天）
PAGE_SIZE = 1000              # 每页条数
TIMEOUT = 30                  # 请求超时（秒）

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": "http://www.xinfadi.com.cn/priceDetail.html",
}

CSV_FIELDS = ["一级分类", "二级分类", "品名", "最低价", "最高价",
              "平均价", "单位", "产地", "规格", "日期"]


def get_child_categories(session, parent_id):
    """获取一级分类下的所有二级分类，返回 [(id, 名称), ...]。"""
    resp = session.post(
        f"{BASE_URL}/getChildCat.html",
        data={"prodCatid": parent_id},
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    cats = resp.json()
    return [(c["id"], c["names"]) for c in cats if c.get("parentId") == parent_id]


def fetch_prices(session, prod_cat_id, start, end):
    """分页拉取某二级分类在 [start, end] 时间范围内的全部价格记录。"""
    records = []
    current = 1
    while True:
        params = {
            "limit": PAGE_SIZE,
            "current": current,
            "pubDateStartTime": start,
            "pubDateEndTime": end,
            "prodPcatid": PARENT_CAT_ID,
            "prodCatid": prod_cat_id,
            "prodName": "",
        }
        resp = session.post(
            f"{BASE_URL}/getPriceData.html", data=params, timeout=TIMEOUT
        )
        resp.raise_for_status()
        data = resp.json()

        total = data.get("count", 0)
        page = data.get("list", [])
        records.extend(page)
        if not page or len(records) >= total:
            break
        current += 1
    return records


def write_csv(records, cat_name):
    """把记录写入以二级分类命名的 CSV 文件。"""
    filename = f"{cat_name}.csv"
    with open(filename, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow(CSV_FIELDS)
        for r in records:
            pub_date = (r.get("pubDate") or "")[:10]
            # 注意：该接口字段命名相反——prodCat 是一级分类，prodPcat 才是二级分类
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

    session = requests.Session()
    session.headers.update(HEADERS)

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
