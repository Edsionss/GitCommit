
// static_scraper_demo.js
// 演示如何使用 axios 获取静态 HTML 内容，并使用 cheerio 解析和提取数据，模拟 Go 中的 goquery 功能。
// 目标：抓取财联社的实时电报新闻。

const axios = require('axios');
const cheerio = require('cheerio');

const CLS_TELEGRAPH_URL = 'https://www.cls.cn/telegraph';

async function scrapeClsTelegraph() {
  console.log(`正在抓取财联社电报页面: ${CLS_TELEGRAPH_URL}`);

  try {
    // 1. 使用 axios 获取网页 HTML
    const response = await axios.get(CLS_TELEGRAPH_URL, {
      headers: {
        // 模拟浏览器 User-Agent，防止被屏蔽
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36'
      }
    });

    const html = response.data;

    // 2. 使用 cheerio 加载 HTML
    const $ = cheerio.load(html);

    const news = [];

    // 3. 使用类似 jQuery 的选择器语法来查找元素
    // Go 版本中查找的是 ".telegraph-content-box"，我们用同样的选择器
    $('.telegraph-content-box').each((index, element) => {
      const time = $(element).find('span').first().text().trim();
      const content = $(element).find('span').last().text().trim();
      const isImportant = $(element).find('span').last().hasClass('c-de0422'); // 重点新闻是红色

      if (time && content) {
        news.push({
          time: time,
          content: content,
          isImportant: isImportant
        });
      }
    });

    if (news.length > 0) {
      console.log(`成功抓取到 ${news.length} 条新闻。`);
      console.log('最新5条新闻:');
      console.table(news.slice(0, 5));
    } else {
      console.log('没有抓取到新闻，可能是页面结构已改变。');
    }

  } catch (error) {
    console.error('抓取过程中发生错误:', error.message);
  }
}

// --- 执行示例 ---
// 在命令行中运行 `node static_scraper_demo.js`。
scrapeClsTelegraph();

