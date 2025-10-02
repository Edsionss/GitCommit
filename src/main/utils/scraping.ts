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

export const AutomaticallyFillWorkSheet = async (data: any) => {
  await executeScrapingTask({
    windowOptions: { show: true },
    beforeExecutionData: data,
    beforeExecution: async (page, repoData) => {
      const {
        username = 'longhai_shen',
        password = 'Biaopu@20241031',
        projectName = '人天汇总',
        taskDescription = '任务描述',
        manDay = '5',
        completionDate = '2025-9-26'
      } = repoData
      // 1. 导航到登录页面 (请替换为你的实际网址)
      await page.goto('http://www.bpsip.com/BPGL/userlogin.jsp', { waitUntil: 'networkidle0' })
      console.log('navigated to login page.')

      // 2. 填写用户名和密码
      await page.type('#username', username, { delay: 100 }) // delay 模拟真实输入
      await page.type('#password', password, { delay: 100 })
      console.log('credentials filled.')

      // 3. 点击登录按钮并等待导航完成
      await page.click('.login')
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

      page.click('text/开发需求人天补充表')
      const iframeSelector = 'iframe[name="inner-frame"]'
      await page.waitForSelector(iframeSelector, { visible: true })
      console.log('iframe loading success')
      const iframeElementHandle = await page.$(iframeSelector)
      if (iframeElementHandle) {
        console.log('iframe get success')
        const frame = await iframeElementHandle.contentFrame()

        if (frame) {
          console.log('iframe contentFrame success')
          await frame.waitForSelector('#defaultTablediv')
          await frame.type('[name="C_fxmmc"]', projectName, { delay: 100 }) // delay 模拟真实输入
          await frame.type('[name="C_fbz"]', taskDescription, { delay: 100 }) // delay 模拟真实输入
          await frame.type('[name="C_frt"]', manDay, { delay: 100 }) // delay 模拟真实输入

          await frame.evaluate((date) => {
            // @ts-ignore
            document.querySelector('[name="C_frq"]').value = date
          }, completionDate)
          console.log('write success')

          await frame.click('#save')
        }
      }
    }
  })
}

export const scrapingStockInfo = (stockName: string) => {
  executeScrapingTask({
    beforeExecution: async (page) => {
      await page.goto(`https://so.eastmoney.com/web/s?keyword=${stockName}`, {
        waitUntil: 'networkidle2'
      })
      const companyName = await page.evaluate(() => {
        return document.querySelector('.amodule .ib_title a span')?.textContent.trim()
      })

      await page.goto(`https://baike.eastmoney.com/item/${companyName}`, {
        waitUntil: 'networkidle2'
      })
      return await page.evaluate(() => {
        let result: any
        try {
          const companyName = document.querySelector('.profile')?.textContent.trim()
          const companyProfile = document.querySelector('.company_intro')?.textContent.trim()
          const infoListEl = document.querySelector('.basic_info_items')?.querySelectorAll('li')
          const infoList: any[] = []
          infoListEl?.forEach((el) => {
            const title = el.querySelector('.info')?.textContent.trim()
            const value = el.querySelector('.name')?.textContent.trim()
            infoList.push({
              title,
              value
            })
          })
          const coreTheme: any[] = []
          const coreThemeList = document
            .querySelector('#coretheme')
            ?.nextElementSibling?.querySelectorAll('.p_div ')
          coreThemeList?.forEach((El, index) => {
            const title = El.querySelector('font')?.textContent.trim()
            const value = El.querySelector('font')?.nextSibling?.textContent?.trim()
            coreTheme.push({ index: '要点' + (index + 1), title, value })
          })
          result = { companyName, companyProfile, infoList, coreTheme }
          return result
        } catch (error) {
          console.log(` scrapingStockInfo  by  ${stockName} fail `)
          throw error
        }
      })
    }
  })
}
