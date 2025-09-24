import { Page } from 'puppeteer-core'

export interface ScrapingTaskOptions<T> {
  beforeExecution?: (page: Page) => Promise<void>
  scrapingLogic: (...args: any[]) => T
  logicArgs?: any[]
  url: string
  windowOptions?: Electron.BrowserWindowConstructorOptions
}
