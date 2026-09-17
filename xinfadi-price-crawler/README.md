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

## 运行

```bash
pip install -r requirements.txt
python xinfadi_crawler.py
```

## 接口

- 获取二级分类：`POST /getChildCat.html`，参数 `prodCatid=<一级分类id>`
- 获取价格数据：`POST /getPriceData.html`，参数 `limit`、`current`、`pubDateStartTime`、
  `pubDateEndTime`、`prodPcatid`（一级分类 id）、`prodCatid`（二级分类 id）、`prodName`

> 注意：该接口返回字段命名相反——`prodCat` 实为一级分类，`prodPcat` 实为二级分类。
