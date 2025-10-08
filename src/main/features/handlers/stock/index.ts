import { initializeNewsHandlers } from './news'
import { initializeHotRankHandlers } from './hotRnak'
export function initializeStockHandlers() {
  initializeNewsHandlers()
  initializeHotRankHandlers()
}
