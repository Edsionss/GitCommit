
// tushare_api_demo.js
// 演示如何使用 axios 发送 POST 请求到一个需要认证的 API，模拟 Tushare API 的调用。

const axios = require('axios');

// Tushare API 的 URL
const TUSHARE_API_URL = 'http://api.tushare.pro';

// 你的 Tushare Token，请替换成你自己的真实 Token
// 注意：请勿将真实的Token硬编码在生产代码中，这里仅为演示。
const TUSHARE_TOKEN = 'YOUR_TUSHARE_TOKEN';

/**
 * 获取A股日线行情数据
 * @param {string} tsCode - 股票代码, 例如 '000001.SZ'
 * @param {string} startDate - 开始日期, 格式 'YYYYMMDD'
 * @param {string} endDate - 结束日期, 格式 'YYYYMMDD'
 */
async function getDailyData(tsCode, startDate, endDate) {
  console.log(`正在为 ${tsCode} 获取从 ${startDate} 到 ${endDate} 的日线数据...`);

  try {
    const response = await axios.post(TUSHARE_API_URL, {
      api_name: 'daily', // Tushare 的接口名称
      token: TUSHARE_TOKEN,
      params: {
        ts_code: tsCode,
        start_date: startDate,
        end_date: endDate,
      },
      fields: 'ts_code,trade_date,open,high,low,close,vol,amount' // 需要返回的字段
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = response.data;

    if (data.code === 0) {
      console.log('成功获取数据:');
      console.log('字段:', data.data.fields);
      console.log('数据条目:', data.data.items.length);
      // 打印前5条数据作为示例
      console.table(data.data.items.slice(0, 5));
    } else {
      console.error('获取数据失败:');
      console.error(`错误代码: ${data.code}`);
      console.error(`错误信息: ${data.msg}`);
    }
  } catch (error) {
    console.error('请求过程中发生错误:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

// --- 执行示例 ---
// 要运行此示例，你需要：
// 1. 将 TUSHARE_TOKEN 替换为你的真实Token。
// 2. 在命令行中运行 `node tushare_api_demo.js`。

// 注意：如果你的Token无效或已过期，API会返回错误。
getDailyData('000001.SZ', '20240101', '20240110');

