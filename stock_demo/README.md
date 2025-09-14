
# Node.js 数据获取演示 (go-stock-dev 项目复现)

这个目录包含了一系列 Node.js 脚本，用于演示和复现 `go-stock-dev` Go 项目中使用的各种网络数据获取技术。

## 准备工作

在运行任何脚本之前，请确保已经安装了所有依赖。在 `nodejs_demo` 目录下执行：

```bash
npm install
```

这会安装 `axios`, `cheerio`, 和 `puppeteer`。

## 脚本说明

### 1. `tushare_api_demo.js`

- **功能**: 演示如何调用一个需要认证的 POST API，模拟对 Tushare Pro 接口的请求。
- **对应Go功能**: `backend/data/tushare_data_api.go`
- **运行**: `node tushare_api_demo.js`
- **注意**: 运行前，你需要将脚本中的 `YOUR_TUSHARE_TOKEN` 替换为你自己的有效Token。

### 2. `static_scraper_demo.js`

- **功能**: 演示如何抓取一个静态的、由服务器直接渲染的HTML页面（财联社电报），并使用 `cheerio` 解析提取信息。
- **对应Go功能**: `backend/data/market_news_api.go` 中使用 `goquery` 的部分。
- **运行**: `node static_scraper_demo.js`

### 3. `dynamic_scraper_demo.js`

- **功能**: 演示如何使用 `puppeteer` 启动一个无头浏览器，来抓取需要执行 JavaScript 才能呈现内容的动态网页。
- **对应Go功能**: `backend/data/crawler_api.go` 中使用 `chromedp` 的部分。
- **运行**: `node dynamic_scraper_demo.js`
- **注意**: 首次运行会下载一个浏览器，可能需要几分钟时间。

### 4. `jsonp_demo.js`

- **功能**: 演示如何处理返回 `JSONP` 格式的API响应。脚本会请求新浪财经的一个接口，然后通过字符串处理提取出纯净的JSON数据。
- **对应Go功能**: `backend/data/market_news_api.go` 中使用 `otto` JS解释器的部分。
- **运行**: `node jsonp_demo.js`

### 5. `various_apis_demo.js`

- **功能**: 集中演示了如何调用在Go项目中发现的多个不同来源的API，例如东方财富的龙虎榜和雪球的热门股票。
- **对应Go功能**: `backend/data/market_news_api.go` 中的多个API调用函数。
- **运行**: `node various_apis_demo.js`
- **注意**: 某些API（如雪球）可能需要有效的 `Cookie` 才能成功返回数据。如果请求失败，可以尝试从浏览器中复制 `Cookie` 并添加到请求头中。

