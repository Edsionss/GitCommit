import { ipcMain } from 'electron'
import { executeScrapingTask } from '@services/puppeteer'

export function initializePuppeteerHandlers() {
  ipcMain.handle('start-scraping', async (event, url: string, scrapingLogic: () => {}) => {
    console.log(`[IPC Handle] 收到爬取请求: ${url}`)
    if (!url) {
      return { success: false, error: 'URL 不能为空。' }
    }

    try {
      // 调用 Service 层来执行实际的工作
      const data = await executeScrapingTask(url, scrapingLogic)

      // 将成功的结果返回给渲染进程
      return { success: true, data: data }
    } catch (error: any) {
      console.error(`[IPC Handle] 爬取服务调用失败:`, error.message)

      // 将失败的结果返回给渲染进程
      return { success: false, error: error.message || '发生未知错误' }
    }
  })
}
