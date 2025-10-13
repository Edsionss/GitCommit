import { sysLogger } from '@nodeUtils/sysLogger'
import { stockNewsService } from '@services/stock/news'
import { systemToolsService } from '@services/system_tools'
import { loadSystemNotify } from '@main/utils/index'

export interface BuiltInTask {
  id: string
  name: string
  description: string
  execute: () => Promise<any>
}

export const builtInTasks: BuiltInTask[] = [
  {
    id: 'send-notification',
    name: '发送通知',
    description: '发送系统通知，使用默认标题和内容。',
    execute: async () => {
      sysLogger.info('Executing built-in task: send-notification')
      try {
        // 使用默认通知内容
        loadSystemNotify('定时任务已执行', '定时任务通知')
        sysLogger.info('Built-in task "send-notification" completed successfully.')
        return { success: true, message: '通知已发送' }
      } catch (error) {
        sysLogger.error('Error executing built-in task "send-notification":', error)
        throw error
      }
    }
  },
  {
    id: 'fetch-stock-news',
    name: '获取股票资讯',
    description: '抓取最新的股票相关新闻并存储到数据库。',
    execute: async () => {
      sysLogger.info('Executing built-in task: fetch-stock-news')
      try {
        const result = await stockNewsService.scrapeAndInsertNews()
        sysLogger.info('Built-in task "fetch-stock-news" completed successfully.')
        return result
      } catch (error) {
        sysLogger.error('Error executing built-in task "fetch-stock-news":', error)
        throw error
      }
    }
  },
  {
    id: 'scheduled-shutdown',
    name: '定时关机',
    description: '立即关闭计算机。此功能目前仅支持 Windows 系统。',
    execute: async () => {
      sysLogger.info('Executing built-in task: scheduled-shutdown')
      try {
        const result = await systemToolsService.shutdownImmediately()
        sysLogger.info('Built-in task "scheduled-shutdown" executed.')
        return result
      } catch (error) {
        sysLogger.error('Error executing built-in task "scheduled-shutdown":', error)
        // 对于关机任务，即使有错误也应该抛出，以便上层可以捕获
        throw error
      }
    }
  }
]

export const getBuiltInTaskById = (id: string): BuiltInTask | undefined => {
  return builtInTasks.find((task) => task.id === id)
}
