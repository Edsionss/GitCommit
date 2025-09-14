
// dynamic_scraper_demo.js
// 演示如何使用 puppeteer 启动一个无头浏览器来抓取由 JavaScript 动态渲染的网页。
// 这对应了 Go 项目中的 chromedp 功能。
// 目标：抓取 http://quotes.toscrape.com/js 上的名言，这个页面的内容是通过JS加载的。

const puppeteer = require('puppeteer');

async function scrapeDynamicPage() {
  console.log('正在启动 Puppeteer...');
  let browser;

  try {
    // 1. 启动一个浏览器实例
    browser = await puppeteer.launch({ 
      headless: true, // 使用无头模式
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // 在某些环境需要的参数
    });

    // 2. 创建一个新页面
    const page = await browser.newPage();

    const url = 'http://quotes.toscrape.com/js';
    console.log(`正在导航到: ${url}`);

    // 3. 导航到目标 URL
    // waitUntil: 'networkidle2' 表示等待直到网络连接基本空闲，确保JS已加载并执行
    await page.goto(url, { waitUntil: 'networkidle2' });

    console.log('页面加载完成，正在提取数据...');

    // 4. 在页面中执行代码，提取数据
    // page.evaluate 会在浏览器环境中执行传入的函数
    const quotes = await page.evaluate(() => {
      const quoteElements = document.querySelectorAll('.quote');
      const quotesArray = [];
      quoteElements.forEach(element => {
        const text = element.querySelector('.text').innerText;
        const author = element.querySelector('.author').innerText;
        quotesArray.push({ text, author });
      });
      return quotesArray;
    });

    if (quotes.length > 0) {
      console.log(`成功提取到 ${quotes.length} 条名言。`);
      console.log('示例名言:');
      console.table(quotes.slice(0, 3));
    } else {
      console.log('未能提取到名言，可能是页面结构已改变。');
    }

  } catch (error) {
    console.error('Puppeteer 抓取过程中发生错误:', error.message);
  } finally {
    // 5. 确保浏览器被关闭
    if (browser) {
      await browser.close();
      console.log('浏览器已关闭。');
    }
  }
}

// --- 执行示例 ---
// 第一次运行 puppeteer 时，它会自动下载一个兼容的浏览器，可能需要一些时间。
// 在命令行中运行 `node dynamic_scraper_demo.js`。
scrapeDynamicPage();

