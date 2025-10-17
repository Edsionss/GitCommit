import { sysLogger } from '@nodeUtils/sysLogger'
import { executeScrapingTask } from '@services/puppeteer'
export const AutomaticallyFillWorkSheet = async (data: any) => {
  await executeScrapingTask({
    beforeExecutionData: data,
    beforeExecution: async (page, repoData) => {
      const {
        username = 'longhai_shen',
        password = 'Biaopu@20241031',
        projectName = '',
        taskDescription = '',
        manDays = '',
        completionDate = '',
        evaluationManDays = ''
      } = repoData
      // 1. 导航到登录页面 (请替换为你的实际网址)
      await page.goto('http://www.bpsip.com/BPGL/userlogin.jsp', { waitUntil: 'networkidle0' })
      sysLogger.log('navigated to login page.')
      // 2. 填写用户名和密码
      await page.type('#username', username, { delay: 100 }) // delay 模拟真实输入
      await page.type('#password', password, { delay: 100 })
      sysLogger.log('credentials filled.')

      // 3. 点击登录按钮并等待导航完成
      await page.click('.login')
      await page.waitForSelector('.panel-tool-expand', { visible: true })
      sysLogger.log('logged in successfully.')

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
      sysLogger.log('iframe loading success')
      const iframeElementHandle = await page.$(iframeSelector)
      if (iframeElementHandle) {
        sysLogger.log('iframe get success')
        const frame = await iframeElementHandle.contentFrame()

        if (frame) {
          sysLogger.log('iframe contentFrame success')
          await frame.waitForSelector('#defaultTablediv')
          await frame.type('[name="C_fxmmc"]', projectName, { delay: 100 }) // delay 模拟真实输入
          await frame.type('[name="C_fbz"]', taskDescription, { delay: 100 }) // delay 模拟真实输入
          await frame.type('[name="C_frt"]', manDays, { delay: 100 }) // delay 模拟真实输入
          await frame.type('[name="C_fpdrt"]', evaluationManDays, { delay: 100 }) // delay 模拟真实输入

          await frame.evaluate((date) => {
            // @ts-ignore
            document.querySelector('[name="C_frq"]').value = date
          }, completionDate)
          sysLogger.log('write success')
          await frame.click('#save')
          await new Promise((r) => setTimeout(r, 5000))
          return {
            success: true,
            message: '日志填写成功'
          }
        }
      }
    }
  })
}
