# 北京新发地农产品价格爬虫（肉禽蛋）

爬取 [北京新发地农产品批发市场](http://www.xinfadi.com.cn/) 一级分类「**肉禽蛋**」下所有二级分类，
近三个月（最近 90 天）的全部价格数据，每个二级分类输出一张 CSV 文件，并统计运行耗时。

## 数据说明

- 一级分类：肉禽蛋（`id=1189`）
- 二级分类：猪肉类(1205)、牛肉类(1206)、羊肉类(1207)、禽蛋类(1208)
- 时间范围：近 90 天（脚本运行当天往前推 90 天）

| 二级分类 | CSV 文件 | 记录数 |
| -------- | -------- | ------ |
| 猪肉类   | `猪肉类.csv` | 3587 |
| 牛肉类   | `牛肉类.csv` | 2576 |
| 羊肉类   | `羊肉类.csv` | 2207 |
| 禽蛋类   | `禽蛋类.csv` | 4508 |

CSV 字段：一级分类、二级分类、品名、最低价、最高价、平均价、单位、产地、规格、日期。

## 防 IP 封禁通用写法

脚本内置了一套可复用的防封禁手段（见 `xinfadi_crawler.py` 中「防 IP 封禁通用写法」注释段）：

1. **User-Agent 池随机轮换** —— 每次请求随机选取 UA，降低被识别为爬虫的概率；
2. **随机休眠** —— 两次请求之间随机等待 0.8~2.5 秒，模拟真人浏览节奏；
3. **失败重试 + 指数退避 + 抖动** —— 对 429（限流）/ 5xx / 网络异常按 `2^n` 退避并叠加随机抖动，
   同时优先读取响应头 `Retry-After`，避免雪崩式重试二次触发封禁；
4. **Session 连接复用** —— `requests.Session()` 复用 TCP 连接，减少握手开销；
5. **浏览器化请求头** —— 附带 `Referer`、`X-Requested-With` 等，模拟浏览器 AJAX 请求。

## 运行

```bash
pip install -r requirements.txt
python xinfadi_crawler.py
```

运行结束会在当前目录生成 4 张 CSV，并在终端打印总运行耗时。

## 接口

- 获取二级分类：`POST /getChildCat.html`，参数 `prodCatid=<一级分类id>`
- 获取价格数据：`POST /getPriceData.html`，参数 `limit`、`current`、`pubDateStartTime`、
  `pubDateEndTime`、`prodPcatid`（一级分类 id）、`prodCatid`（二级分类 id）、`prodName`

> 注意：该接口返回字段命名相反——`prodCat` 实为一级分类，`prodPcat` 实为二级分类。
