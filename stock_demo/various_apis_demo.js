// various_apis_demo.js
// 演示如何调用在 Go 项目中发现的来自多个不同源的 API。
// 这展示了 axios 如何用于请求具有不同 URL 结构和查询参数的各种端点。

const axios = require('axios');

// --- 1. 东方财富 - 龙虎榜数据 ---
async function getEastmoneyLonghu() {
  console.log('\n--- 正在获取东方财富龙虎榜数据... ---');
  const url = 'https://datacenter-web.eastmoney.com/api/data/v1/get';
  const today = new Date().toISOString().slice(0, 10); // 获取今天的日期, YYYY-MM-DD

  try {
    const response = await axios.get(url, {
      params: {
        // 这些参数是从 Go 代码中分析得来的
        reportName: 'RPT_DAILYBILLBOARD_DETAILSNEW',
        columns: 'SECURITY_CODE,SECURITY_NAME_ABBR,TRADE_DATE,EXPLAIN,CLOSE_PRICE,CHANGE_RATE',
        source: 'WEB',
        client: 'WEB',
        filter: `(TRADE_DATE<='${today}')(TRADE_DATE>='${today}')`,
        pageSize: 5, // 只取5条作为演示
        pageNumber: 1,
        sortColumns: 'TURNOVERRATE',
        sortTypes: '-1',
      },
      headers: {
        'Referer': 'https://data.eastmoney.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36'
      }
    });

    // 这个接口返回的也是 JSONP 风格，但更简单，可以直接取 result
    if (response.data && response.data.result) {
      const data = response.data.result.data;
      console.log(`成功获取 ${data.length} 条龙虎榜数据。`);
      console.table(data);
    } else {
      console.log('获取数据失败或无数据。', response.data);
    }
  } catch (error) {
    console.error('获取东方财富数据时出错:', error.message);
  }
}

// --- 2. 雪球 - 热门股票 ---
async function getXueqiuHotStocks() {
  console.log('\n--- 正在获取雪球热门股票... ---');
  // _type=10 表示A股, size=5 表示获取5条
  const url = 'https://stock.xueqiu.com/v5/stock/hot_stock/list.json?page=1&size=5&_type=10&type=10';

  try {
    // 雪球的API需要有效的Cookie才能访问，这里我们先尝试直接访问
    // 在实际应用中，可能需要先访问首页获取初始Cookie，或者配置一个固定的有效Cookie
    const response = await axios.get(url, {
      headers: {
        'Host': 'stock.xueqiu.com',
        'Referer': 'https://xueqiu.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
        // 如果直接请求失败，可能需要在这里填入一个从浏览器中复制的有效Cookie
        // 'Cookie': 'xq_a_token=YOUR_COOKIE_HERE; ...'
      }
    });

    if (response.data.data && response.data.data.items) {
      const stocks = response.data.data.items;
      console.log(`成功获取 ${stocks.length} 条雪球热门股票。`);
      // 提取关键信息进行展示
      const simplifiedStocks = stocks.map(s => ({
        name: s.name,
        symbol: s.symbol,
        current: s.current,
        chg_percent: s.percent
      }));
      console.table(simplifiedStocks);
    } else {
      console.log('获取雪球数据失败或需要Cookie。错误信息:', response.data.error_description || '');
    }
  } catch (error) {
    console.error('获取雪球数据时出错:', error.message);
    if (error.response && error.response.status === 401) {
        console.error('错误状态 401: 未授权。这通常意味着你需要提供一个有效的Cookie才能访问雪球API。');
    }
  }
}

// --- 执行所有示例 ---
async function runAllDemos() {
  await getEastmoneyLonghu();
  await getXueqiuHotStocks();
}

// 在命令行中运行 `node various_apis_demo.js`。
runAllDemos();
