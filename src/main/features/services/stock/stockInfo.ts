import { executeScrapingTask } from '@services/puppeteer'

export const scrapingStockInfo = (stockName: string) => {
  executeScrapingTask({
    beforeExecution: async (page) => {
      const data: any = {}
      await page.goto(`https://so.eastmoney.com/web/s?keyword=${stockName}`, {
        waitUntil: 'networkidle0'
      })
      await page.click('.amodule .ib_title a')

      await page.evaluate(() => {
        let result: any
        try {
          const companyName = document.querySelector('.profile')?.textContent
          const companyProfile = document.querySelector('.company_intro')?.textContent
          const infoListEl = document.querySelector('.basic_info_items')?.querySelectorAll('li')
          const infoList: any[] = []
          infoListEl?.forEach((el) => {
            const title = el.querySelector('.info')?.textContent
            const value = el.querySelector('.name')?.textContent
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
            const title = El.querySelector('font')?.textContent
            const value = El.querySelector('font')?.nextSibling?.textContent
            coreTheme.push({ index: '要点' + (index + 1), title, value })
          })
          result = { companyName, companyProfile, infoList, coreTheme }
        } catch (error) {
          console.log(` scrapingStockInfo  by  ${stockName} fail `)
          throw error
        }
      })
    }
  })
}
