import { initializeNewsHandlers } from './news'
import { initializeHotRankHandlers } from './hotRnak'
import { initializeSectorHandlers } from './sectors'
export function initializeStockHandlers() {
  initializeNewsHandlers()
  initializeHotRankHandlers()
  initializeSectorHandlers()
}
