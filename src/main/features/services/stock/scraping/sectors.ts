import { executeScrapingTask } from '@services/puppeteer'
import { mergeColumnArrayList } from '@nodeUtils/index'

export const scrapingThsIndustry = async (extractTableDataByColumn: Function) => {
  return executeScrapingTask({
    beforeExecutionData: { extractTableDataByColumn },
    beforeExecution: async (page, { extractTableDataByColumn }) => {
      const allData: any[] = []
      const homeUrl = 'https://q.10jqka.com.cn/thshy/'
      // 设置一个较长的超时时间，并等待网络空闲
      await page.goto(homeUrl, { waitUntil: 'networkidle2', timeout: 60000 })
      console.log(`📄 正在访问首页: ${homeUrl}`)

      // --- 1. 获取表头 ---
      // page.evaluate 会在浏览器上下文中执行代码
      // const columnTitles = await page.evaluate(() => {
      //   return Array.from(document.querySelectorAll('thead tr th')).map((th) =>
      //     th.textContent.trim()
      //   )
      // })

      // if (columnTitles.length === 0) {
      //   throw new Error('❌ 无法在首页找到表头 <th>, 爬取中止。')
      // }
      // console.log('✅ 成功获取表头:', columnTitles)

      // --- 2. 获取总页数 ---
      const totalPages = await page.evaluate(() => {
        const pageText = document.querySelector('.page_info')?.textContent.trim() // "1/33"
        return pageText ? parseInt(pageText.split('/')[1]) : 1
      })
      console.log(`📄 共 ${totalPages} 页`)

      // --- 3. 循环所有分页 ---
      for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
        console.log(`🔎 正在处理第 ${currentPage} 页...`)

        // 对于第一页，数据已经加载好了，直接解析
        if (currentPage > 1) {
          // 找到“下一页”按钮并点击
          console.log('🖱️ 点击下一页...')
          await page.click('.changePage')
          // 等待表格内容更新，一个好的策略是等待一个特定的元素出现或网络请求完成
          // 这里我们用一个简单的方法：等待 Ajax 请求完成
          await page.waitForResponse((response) => response.url().includes('/ajax/1/'), {
            timeout: 30000
          })
          await new Promise((resolve) => setTimeout(resolve, 500)) // 额外等待一下渲染
        }

        // --- 4. 提取当前页的数据 ---
        const pageData = await page.evaluate(
          (extractTableDataByColumn) => {
            const tableFn = new Function(
              'tableEl',
              `return (${extractTableDataByColumn})(tableEl);`
            )
            let results: any[] = []
            const tableEl = document.querySelector('#maincont')?.querySelector('table')
            results = tableFn(tableEl)
            return results
          },
          // columnTitles,
          extractTableDataByColumn.toString()
        ) // 将 columnTitles 作为参数传入 evaluate
        allData.push(pageData)
        console.log(`✅ 第 ${currentPage} 页处理完毕，获得 ${pageData.length} 条数据。`)
      }
      console.log(`🎉 抓取完成！共获得 ${allData.length} 条数据。`)
      return mergeColumnArrayList(allData)
    }
  })
}
