import { ipcMain } from 'electron'
import { CheerioScrapingService } from '@services/cheerio'

const cheerioScrapingService = new CheerioScrapingService()

export function registerCheerioHandlers() {
  ipcMain.handle('cheerio:Scraping', (_, url: string, scrapingLogic: ($?: any) => {}) => {
    try {
      return cheerioScrapingService.scrape(url, scrapingLogic)
    } catch (error) {
      console.error('Error during scraping:', error)
      throw error
    }
  })
}
