
// jsonp_demo.js
// 演示如何处理 JSONP (JSON with Padding) 格式的 API 响应。
// Go 项目中使用 otto (一个JS解释器) 来处理，在 Node.js 中则简单得多。
// 目标：请求新浪财经的一个接口，该接口返回 JSONP 格式的数据，并从中提取有效的 JSON。

const axios = require('axios');

// 新浪财经的某个直播新闻接口，它返回 JSONP 格式
const SINA_JSONP_URL = `https://zhibo.sina.com.cn/api/zhibo/feed?callback=callback&page=1&page_size=10&zhibo_id=152&tag_id=0&dpc=1`;

async function handleJsonpResponse() {
  console.log(`正在请求 JSONP 接口: ${SINA_JSONP_URL}`);

  try {
    const response = await axios.get(SINA_JSONP_URL, {
      headers: {
        'Referer': 'https://finance.sina.com.cn',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36'
      }
    });

    let jsonpData = response.data;
    console.log(`收到的原始 JSONP 响应 (前100个字符): ${jsonpData.substring(0, 100)}...`);

    // JSONP 格式通常是 `callbackName({...});` 或 `try{callbackName({...});}catch(e){};`
    // 我们的目标是提取括号 `()` 中的 JSON 对象。

    // 1. 找到第一个 `(` 和最后一个 `)` 的位置
    const firstParen = jsonpData.indexOf('(');
    const lastParen = jsonpData.lastIndexOf(')');

    if (firstParen === -1 || lastParen === -1) {
      throw new Error('响应不是有效的 JSONP 格式。');
    }

    // 2. 截取括号内的字符串
    const jsonString = jsonpData.substring(firstParen + 1, lastParen);

    // 3. 将截取的字符串解析为 JSON 对象
    const jsonData = JSON.parse(jsonString);

    console.log('成功提取并解析 JSON 数据！');

    // 打印一些提取出的数据作为验证
    const newsList = jsonData.result.data.feed.list;
    if (newsList && newsList.length > 0) {
      console.log(`获取到 ${newsList.length} 条新闻。`);
      console.log('第一条新闻内容:', newsList[0].rich_text);
    } else {
      console.log('未在数据中找到新闻列表。');
    }

  } catch (error) {
    console.error('处理 JSONP 过程中发生错误:', error.message);
  }
}

// --- 执行示例 ---
// 在命令行中运行 `node jsonp_demo.js`。
handleJsonpResponse();

