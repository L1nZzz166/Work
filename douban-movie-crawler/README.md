# 豆瓣电影爬虫（100 部）

抓取豆瓣「豆瓣高分」分类下 **100 部电影** 的详情，输出 `douban_movies.csv`，并统计运行耗时。

## 字段

| 列名 | 说明 |
| --- | --- |
| 电影名称 | 中文片名 |
| 封面链接 | 海报图片 URL |
| 导演 | 多名以 ` / ` 分隔 |
| 编剧 | 多名以 ` / ` 分隔 |
| 主演 | 最多 8 位，` / ` 分隔 |
| 类型 | 如 剧情 / 犯罪 |
| 制片国家/地区 | 如 美国 |
| 语言 | 如 英语 |
| 上映日期 | 接口返回的公映日期 |
| 片长 | 如 142分钟 |
| 豆瓣评分 | 如 9.7 |
| 评价人数 | 评分人数 |

## 运行

```bash
pip install -r requirements.txt
python douban_movie_crawler.py
```

完成后会生成：

- `douban_movies.csv`：结果表（UTF-8 BOM，可用 Excel 直接打开）
- `run_stats.txt`：电影数量与总耗时
- `checkpoint.json`：断点文件（中断后再次运行可续爬，不提交到 Git）

## 本次运行结果

- 电影数量：**100**
- 总运行耗时：**1040.68 秒**（约 17.3 分钟，含限流退避与断点续爬）
- 结果文件：`douban_movies.csv`

豆瓣移动端演职人员接口每次只返回 8 位精选人员。若这 8 人中没有编剧，对应「编剧」列会留空（约 16 部），其余字段均已补齐。

上映日期以接口当前返回值为准，可能是最新一次公映/重映日期，而不一定是首映年份。

## 防 IP 封禁（通用写法）

脚本把常见防封策略集中在 `AntiBanSession`：

1. **Session 复用**：保持连接，减少异常握手。
2. **User-Agent / Accept-Language 轮换**：降低单一浏览器指纹。
3. **随机限速**：每次成功请求后休眠 `1.6 ~ 3.2` 秒。
4. **指数退避**：遇到 `400 / 403 / 418 / 429 / 5xx`、`subject_ip_rate_limit` 或验证码页时加倍等待，并加随机抖动。
5. **超时重试**：网络抖动自动重试，连续失败过多则主动停止。
6. **断点续爬**：每抓一部即写 CSV + checkpoint，中断后可接着跑。
7. **可选代理**：读取环境变量 `HTTP_PROXY` / `HTTPS_PROXY`，不在代码里写死代理 IP。

```powershell
$env:HTTPS_PROXY = "http://127.0.0.1:7890"
python douban_movie_crawler.py
```

## 接口

- 列表：`GET https://movie.douban.com/j/search_subjects`
- 详情：`GET https://m.douban.com/rexxar/api/v2/subject/{id}`
- 演职人员：`GET https://m.douban.com/rexxar/api/v2/subject/{id}/credits`
