import { sysLogger } from '@nodeUtils/sysLogger'
import { ipcMain } from 'electron'
import { executeScrapingTask } from '@services/puppeteer'
import { ScrapingTaskOptions } from '@sharedType/Puppeteer'

export function initializePuppeteerHandlers() {
  ipcMain.handle(
    'start-scraping',
    async <T>(event, ScrapingTaskOptions: ScrapingTaskOptions<T>) => {
      const { url, scrapingLogic } = ScrapingTaskOptions
      sysLogger.log(`[IPC Handle] 收到爬取请求: ${url}`)
      if (!url) {
        return { success: false, error: 'URL 不能为空。' }
      }
      if (typeof scrapingLogic !== 'function') {
        return { success: false, error: '无效的爬取逻辑函数。' }
      }
      try {
        // 调用 Service 层来执行实际的工作
        const data = await executeScrapingTask(ScrapingTaskOptions)

        // 将成功的结果返回给渲染进程
        return { success: true, data: data }
      } catch (error: any) {
        sysLogger.error(`[IPC Handle] 爬取服务调用失败:`, error.message)

        // 将失败的结果返回给渲染进程
        return { success: false, error: error.message || '发生未知错误' }
      }
    }
  )
}
