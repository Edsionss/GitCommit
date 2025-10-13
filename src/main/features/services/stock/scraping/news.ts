import { sysLogger } from '@nodeUtils/sysLogger'
import { executeScrapingTask } from '@services/puppeteer'
import { getYesterdayCN, isTimeAfter, addIdsFast } from '@nodeUtils/index'
import type { StockNews } from '@sharedType/stockNews'

export const telegraphTest = async (dateStr?: string, timeStr?: string) => {
  timeStr = timeStr || '15:00:00'
  dateStr = dateStr || getYesterdayCN()

  return await executeScrapingTask({
    beforeExecutionData: { isTimeAfter, timeStr, dateStr },
    beforeExecution: async (page, { isTimeAfter, timeStr, dateStr }) => {
      await page.goto('https://www.cls.cn/telegraph', { waitUntil: 'networkidle2' })
      await Promise.all([
        page.click('.more-button'),
        await page.waitForResponse(
          (response) => response.url().includes('telegraphList') && response.status() === 200
        )
      ])
      sysLogger.log('✅ 加载更多完成')
      const getStopScroll = () => {
        return page.evaluate(
          (dateStr: string, timeStr: string, isTimeAfterStr: string) => {
            let stopScroll: boolean = true
            const result: any[] = []
            const isTimeAfterFn = new Function('t1,t2', `return (${isTimeAfterStr})(t1,t2);`)
            const allTelegraph = Array.from(document.querySelectorAll('.telegraph-content-box'))
            const lastTelegraph = allTelegraph[allTelegraph.length - 1]
            if (lastTelegraph && lastTelegraph.children.length > 1) {
              const data = lastTelegraph.firstElementChild?.textContent.trim()
              if (data == dateStr) {
                // ✅ 到达昨天，
                console.log('✅ 到达昨天', data, dateStr)
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
                        const isImportant = contentBox.classList.contains('c-de0422') ? 1 : 0
                        result.push({
                          newsDate:
                            dataBox?.textContent?.trim() ||
                            currentDateBox?.textContent
                              ?.trim()
                              .match(/\d{4}\.\d{2}\.\d{2}\s星期./)?.[0] ||
                            '',
                          newsTime: timeBox?.textContent?.trim() || '',
                          content: newsBox?.textContent?.trim() || '',
                          title: titleBox?.textContent?.trim() || '',
                          isImportant,
                          tradeDate: dateStr
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
          dateStr,
          timeStr,
          isTimeAfter.toString()
        )
      }
      let stopScroll: boolean = true
      let result: Omit<StockNews, 'createdAt'>[] = []
      while (stopScroll) {
        // 滚动到页面底部以触发“加载更多”
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        sysLogger.log('✅ 滚动完成')
        page.waitForResponse(
          (response) => response.url().includes('telegraphList') && response.status() === 200
        )
        sysLogger.log('✅ 等待加载完成')

        // 判断是否需要停止（解构返回值）
        const { stopScroll: newStopScroll, result: newResult } = await getStopScroll()
        stopScroll = newStopScroll
        result = newResult

        await new Promise((r) => setTimeout(r, 500)) // ✅ 稳定性等待

        // 如果需要停止就跳出循环
        if (!stopScroll) break
      }

      return addIdsFast(result, 'stock_news') as Omit<StockNews, 'createdAt'>[]
    }
  })
}
