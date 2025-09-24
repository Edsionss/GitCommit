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
        // const news: HTMLElement | null = titleBox?.nextSibling as HTMLElement
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
  //------------------------------
}

export const thsTest = () => {
  const stockName = '亚太药业'
  // 对查询字符串进行编码
  const encodedStockName: string = encodeURIComponent(stockName)
  console.log('https://www.iwencai.com/unifiedwap/result?tid=stockpick&qs=box_main_ths&w=亚太药业')

  // 测试爬虫任务
  executeScrapingTask({
    url: `https://www.iwencai.com/unifiedwap/result?tid=stockpick&qs=box_main_ths&w=${'亚太药业'}`,
    scrapingLogic: () => {
      const result: any[] = []
      const elementsBox: HTMLElement | null = document.querySelector('.jgy_sdk')
      if (!elementsBox) return
      const elements: HTMLElement[] = Array.from(elementsBox.querySelectorAll('.jgy_item_box'))
      elements.forEach((el) => {
        result.push(el.textContent.trim())
      })
      return result
    }
  }).then((data) => {
    console.log('Scraped data:', data)
  })
}
