import { executeScrapingTask } from '@services/puppeteer'
export const telegraphTest = () => {
  // 测试爬虫任务
  executeScrapingTask({
    url: 'https://www.cls.cn/telegraph',
    scrapingLogic: () => {
      const result: any[] = []
      const elements: HTMLElement[] = Array.from(
        document.querySelectorAll('.telegraph-content-box')
      )
      elements.forEach((el) => {
        const timeBox: HTMLElement | null = el.querySelector('.telegraph-time-box')
        if (!timeBox) return // 如果没有时间盒子，跳过这个元素
        const contentBox: HTMLElement | null = timeBox.nextElementSibling as HTMLElement
        if (!contentBox) return // 如果没有内容盒子，跳过这个元素
        const titleBox: HTMLElement | null = contentBox.querySelector('strong')
        let newsBox: HTMLElement | null = null
        if (titleBox) {
          newsBox = titleBox?.nextSibling as HTMLElement
        } else {
          newsBox = contentBox.querySelector('div')
        }
        const isImportant = contentBox.classList.contains('c-de0422')
        result.push({
          time: timeBox?.textContent?.trim() || '',
          content: newsBox?.textContent?.trim() || '',
          title: titleBox?.textContent?.trim() || '',
          isImportant
        })
      })
      return result
    }
  }).then((data) => {
    console.log('Scraped data:', data)
  })
}

export const thsTest = () => {
  const stockName = '亚太药业'
  // 对查询字符串进行编码
  const encodedStockName: string = encodeURIComponent(stockName)
  // 测试爬虫任务
  executeScrapingTask({
    url: `https://www.iwencai.com/unifiedwap/result?tid=stockpick&qs=box_main_ths&w=${encodedStockName}`,
    scrapingLogic: () => {
      const result: any[] = []
      const elementsBox: HTMLElement | null = document.querySelector('.jgy_sdk')
      if (!elementsBox) return
      const elements: HTMLElement[] = Array.from(elementsBox.querySelectorAll('.jgy_item_box'))
      elements.forEach((el) => {
        const titleEl: HTMLElement | null = el.querySelector('.title-content .title-text')
        const textContent: HTMLElement | null = el.querySelector('.jgy_txt ')
        if (!titleEl || !textContent) return
        result.push({
          title: titleEl?.textContent.trim() || '',
          content: textContent?.textContent.trim() || ''
        })
      })
      // 提取标签
      const tagContainer: HTMLElement | null = document.querySelector('.impression_list')
      if (tagContainer) {
        const tags: any[] = []
        const tagElements: NodeListOf<HTMLElement> = tagContainer.querySelectorAll('.list_item')
        tagElements.forEach((tagEl) => {
          const isGood = tagEl.classList.contains('good')
          tags.push({ value: tagEl.textContent.trim(), good: isGood })
        })
        result.push({ title: '标签', content: JSON.stringify(tags) })
      }
      //提取支撑和压力
      const supportResistanceContainer: HTMLElement | null =
        document.querySelector('.kline_markline')
      if (supportResistanceContainer) {
        result.push({ title: '支撑和压力', content: supportResistanceContainer.innerText.trim() })
      }

      return result
    }
  }).then((data) => {
    console.log('Scraped data:', data)
  })
}

export const AutomaticallyFillWorkSheet = () => {
  executeScrapingTask({
    windowOptions: { show: true },
    beforeExecution: async (page) => {
      // 1. 导航到登录页面 (请替换为你的实际网址)
      await page.goto('http://www.bpsip.com/BPGL/userlogin.jsp', { waitUntil: 'networkidle0' })
      console.log('navigated to login page.')

      // 2. 填写用户名和密码
      await page.type('#username', 'longhai_shen', { delay: 100 }) // delay 模拟真实输入
      await page.type('#password', 'Biaopu@20241031', { delay: 100 })
      console.log('credentials filled.')

      // 3. 点击登录按钮并等待导航完成
      await page.click('.login')
      // await page.waitForNavigation({ waitUntil: 'networkidle2' })
      await page.waitForSelector('.panel-tool-expand', { visible: true })
      console.log('logged in successfully.')

      // 4. 导航到日志填写页面
      // 点开折叠栏
      await page.click('.panel-tool-expand')
      // 等待两秒
      await new Promise((r) => setTimeout(r, 1000))
      // 点开日志菜单
      await page.click('.FirstLayer')
      await new Promise((r) => setTimeout(r, 1000))
      await page.click('.lastExpandable')
      await new Promise((r) => setTimeout(r, 1000))
      await page.click('text/开发需求人天补充表')
      const response = await page.waitForResponse(
        (response) => response.url().includes('/action_show') && response.status() === 200
      )
      const responseBody = await response.json()
      const [linkHandle] = await page.$$(
        '/html/body/form/div/div[2]/table/tbody/tr[2]/td[2]/textarea'
      )
      if (linkHandle) {
        await linkHandle.click()
        console.log('通过 XPath 成功点击了链接。')
      } else {
        throw new Error('未找到指定的链接！')
      }
    }
  })
}
