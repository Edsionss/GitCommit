import { Page } from 'puppeteer-core'

export interface ScrapingTaskOptions<T> {
  beforeExecution?: (page: Page, beforeExecutionData?: any, scrapeWindow?: any) => Promise<T> | T
  scrapingLogic?: (...args: any[]) => T
  beforeExecutionData?: any
  logicArgs?: any[]
  url?: string
  windowOptions?: Electron.BrowserWindowConstructorOptions
  captureError?: boolean
  debuggerMode?: boolean
}
