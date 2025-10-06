import { executeScrapingTask } from '@services/puppeteer'
import { getYesterdayCN, isTimeAfter, extractTableDataByColumn } from '@nodeUtils/index'
export const telegraphTest = (timeStr?: string) => {
  // 测试爬虫任务
  timeStr = timeStr || '15:00:00'
  executeScrapingTask({
    // debuggerMode: true,
    beforeExecutionData: { isTimeAfter, timeStr },
    beforeExecution: async (page, { isTimeAfter, timeStr }) => {
      await page.goto('https://www.cls.cn/telegraph', { waitUntil: 'networkidle2' })
      await Promise.all([
        page.click('.more-button'),
        await page.waitForResponse(
          (response) => response.url().includes('telegraphList') && response.status() === 200
        )
      ])
      console.log('✅ 加载更多完成')

      const getStopScroll = () => {
        const yesterdayCN = getYesterdayCN()
        return page.evaluate(
          (yesterdayCN: string, timeStr: string, isTimeAfterStr: string) => {
            let stopScroll: boolean = true
            const result: any[] = []
            const isTimeAfterFn = new Function('t1,t2', `return (${isTimeAfterStr})(t1,t2);`)
            const allTelegraph = Array.from(document.querySelectorAll('.telegraph-content-box'))
            const lastTelegraph = allTelegraph[allTelegraph.length - 1]
            if (lastTelegraph && lastTelegraph.children.length > 1) {
              const data = lastTelegraph.firstElementChild?.textContent.trim()
              if (data == yesterdayCN) {
                // ✅ 到达昨天，
                console.log('✅ 到达昨天', data, yesterdayCN)
                const lastTime = lastTelegraph
                  .querySelector('.telegraph-time-box')
                  ?.textContent.trim()
                console.log(
                  '✅ 检测最后一条时间',
                  lastTime,
                  timeStr,
                  isTimeAfterFn(lastTime, timeStr)
                )
                if (!isTimeAfterFn(lastTime, timeStr)) {
                  console.log('✅ 时间小于截止时间， 停止滚动')
                  stopScroll = false
                  const lastTelegraph20 = allTelegraph.slice(-20)
                  for (const [index, El] of lastTelegraph20.entries()) {
                    const time = El.querySelector('.telegraph-time-box')?.textContent.trim()
                    console.log(
                      '✅ 时间对比 当前时间 和 截止时间',
                      time,
                      timeStr,
                      isTimeAfterFn(time, timeStr)
                    )
                    if (!isTimeAfterFn(time, timeStr)) {
                      const effectiveLength = allTelegraph.length - (20 - index)
                      const effectiveTelegraphs = allTelegraph.slice(0, effectiveLength)
                      console.log(
                        `✅ 时间小于截止时间,停止循环，当前下标 ${index} 有效数据长度 ${effectiveLength},总长度${allTelegraph.length}`
                      )
                      const currentDateBox = document.querySelector(
                        '.telegraph-top-switch-box'
                      )?.previousElementSibling
                      effectiveTelegraphs.forEach((el) => {
                        const dataBox = el.children.length > 1 ? el.firstElementChild : null
                        const timeBox: HTMLElement | null = el.querySelector('.telegraph-time-box')
                        if (!timeBox) return // 如果没有时间盒子，跳过这个元素
                        const contentBox: HTMLElement | null =
                          timeBox.nextElementSibling as HTMLElement
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
                          data:
                            dataBox?.textContent?.trim() ||
                            currentDateBox?.textContent
                              ?.trim()
                              .match(/\d{4}\.\d{2}\.\d{2}\s星期./) ||
                            '',
                          time: timeBox?.textContent?.trim() || '',
                          content: newsBox?.textContent?.trim() || '',
                          title: titleBox?.textContent?.trim() || '',
                          isImportant
                        })
                      })
                      break
                    }
                  }
                }
              }
            }
            return { stopScroll, result }
          },
          yesterdayCN,
          timeStr,
          isTimeAfter.toString()
        )
      }
      let stopScroll: boolean = true
      let result: any[] = []
      while (stopScroll) {
        // 滚动到页面底部以触发“加载更多”
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        console.log('✅ 滚动完成')
        page.waitForResponse(
          (response) => response.url().includes('telegraphList') && response.status() === 200
        )
        console.log('✅ 等待加载完成')

        // 判断是否需要停止（解构返回值）
        const { stopScroll: newStopScroll, result: newResult } = await getStopScroll()
        stopScroll = newStopScroll
        result = newResult

        await new Promise((r) => setTimeout(r, 500)) // ✅ 稳定性等待

        // 如果需要停止就跳出循环
        if (!stopScroll) break
      }

      return result
    }
  }).then((data) => {
    console.log('Scraped data:', data.length, data[0], data[data.length - 1])
    console.log(getYesterdayCN())
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
        const title = titleEl?.textContent.trim() || ''
        const content = textContent?.textContent.trim() || ''
        if (title == '牛叉诊股' || title == '简介和看点' || title == '龙虎榜分析') return
        result.push({
          title,
          content
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
    beforeExecutionData: { stockName: stockName, extractTableDataByColumn },
    beforeExecution: async (page, { stockName, extractTableDataByColumn }) => {
      let result: any
      await page.goto(`https://so.eastmoney.com/web/s?keyword=${stockName}`, {
        waitUntil: 'networkidle2'
      })
      const companyName = await page.evaluate(() => {
        return document.querySelector('.amodule .ib_title a span')?.textContent.trim()
      })

      await page.goto(`https://baike.eastmoney.com/item/${companyName}`, {
        waitUntil: 'networkidle2'
      })
      const dfcfData = await page.evaluate((stockName) => {
        let result: any
        try {
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
          result = { companyProfile, infoList, coreTheme }
          return result
        } catch (error) {
          throw error
        }
      }, stockName)

      await page.goto(
        `https://www.iwencai.com/stockpick/search?tid=stockpick&qs=box_main_ths&w=${stockName}`,
        {
          waitUntil: 'networkidle0'
        }
      )
      const text = await page.$eval('.back-old-btn span', (el) => el.textContent?.trim() || '')
      if (text == '返回旧版') {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle2' }), // 等待跳转
          page.click('.back-old-btn')
        ])
      }
      const folds = await page.$$('text/展开')
      for (const fold of folds) {
        await fold.click()
        await new Promise((r) => setTimeout(r, 500)) // 给点时间让页面展开
      }
      const thsData = await page.evaluate(
        (stockName, extractTableDataByColumn) => {
          try {
            const tableFn = new Function(
              'tableEl',
              `return (${extractTableDataByColumn})(tableEl);`
            )
            const productBox = document.querySelector('.sortCol')
            const productElList = productBox?.querySelectorAll('.fl')
            const productList: any = []
            const conceptBox = productBox?.nextElementSibling
            const conceptElList = conceptBox?.querySelectorAll('.fl')
            const conceptList: any = []
            productElList?.forEach((El) => {
              productList.push(El.querySelector('a')?.textContent.trim())
            })
            conceptElList?.forEach((El) => {
              conceptList.push(El.querySelector('a')?.textContent.trim())
            })
            const city = conceptBox?.nextElementSibling?.querySelector('a')?.textContent.trim()
            const industry = conceptBox?.nextElementSibling?.nextElementSibling
              ?.querySelector('a')
              ?.textContent.trim()
            let RecentImportantEvents: any[] = []
            const allCards = document.querySelectorAll('.zhuanti_block .block_con')
            allCards.forEach((card) => {
              const title = card
                .querySelector('.blockTitle .title_icon')
                ?.nextElementSibling?.textContent.trim()
              if (title === '近期重要事件') {
                RecentImportantEvents = tableFn(card?.querySelector('table') as HTMLTableElement)
              }
            })
            return {
              productList, // 产品
              conceptList, // 概念
              city, // 地域
              industry, // 行业
              RecentImportantEvents // 近期重要事件
            }
          } catch (error) {
            throw error
          }
        },
        stockName,
        extractTableDataByColumn.toString()
      )
      result = { ...dfcfData, ...thsData, companyName }
      return result
    },
    url: `https://www.iwencai.com/unifiedwap/result?tid=stockpick&qs=box_main_ths&w=${stockName}`,
    scrapingLogic: () => {
      const result: any[] = []
      const elementsBox: HTMLElement | null = document.querySelector('.jgy_sdk')
      if (!elementsBox) return
      const elements: HTMLElement[] = Array.from(elementsBox.querySelectorAll('.jgy_item_box'))
      elements.forEach((el) => {
        const titleEl: HTMLElement | null = el.querySelector('.title-content .title-text')
        const textContent: HTMLElement | null = el.querySelector('.jgy_txt ')
        if (!titleEl || !textContent) return
        const title = titleEl?.textContent.trim() || ''
        const content = textContent?.textContent.trim() || ''
        if (title == '牛叉诊股' || title == '简介和看点' || title == '龙虎榜分析') return
        result.push({
          title,
          content
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
  })
}
