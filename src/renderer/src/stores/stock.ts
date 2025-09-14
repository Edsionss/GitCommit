import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { StockData } from '@sharedType/stock'

// 从 localStorage 加载持久化的数据
const loadWatchListFromStorage = (): Map<string, StockData> => {
  const stored = localStorage.getItem('stock_watchList')
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as { code: string; name: string }[]
      const watchList = new Map<string, StockData>()
      parsed.forEach((item) => {
        // For performance, only load basic info initially.
        // Detailed data will be fetched on demand.
        watchList.set(item.code, {
          ...item,
          kline: [],
          indicators: {},
          news: [],
          lastUpdateTime: '',
          analysisHistory: []
        })
      })
      return watchList
    } catch (error) {
      console.error('Failed to parse watchList from localStorage', error)
      return new Map()
    }
  }
  return new Map()
}

// 持久化 watchList 到 localStorage
const saveWatchListToStorage = (watchList: Map<string, StockData>) => {
  // Persist only the identifiers, not the full data.
  const simplified = Array.from(watchList.values()).map(({ code, name }) => ({ code, name }))
  localStorage.setItem('stock_watchList', JSON.stringify(simplified))
}

export const useStockStore = defineStore('stock', () => {
  // --- State ---
  const watchList = reactive<Map<string, StockData>>(loadWatchListFromStorage())
  const activeStockCode = ref<string | null>(null)

  // --- Actions ---

  /**
   * (高级版本) 添加从wizard获取的完整股票数据
   * @param stockData - The complete stock data object from the wizard/backend.
   */
  const addStockWithOptions = async (stockData: StockData) => {
    if (watchList.has(stockData.code)) {
      alert('该股票已在自选列表中')
      return
    }
    watchList.set(stockData.code, stockData)
    saveWatchListToStorage(watchList)
  }

  /**
   * 从自选列表删除股票
   * @param stockCode - 股票代码
   */
  const removeStock = (stockCode: string) => {
    if (watchList.has(stockCode)) {
      watchList.delete(stockCode)
      saveWatchListToStorage(watchList)
      if (activeStockCode.value === stockCode) {
        activeStockCode.value = null
      }
    }
  }

  /**
   * 设置当前活跃的股票
   * @param stockCode - 股票代码
   */
  const setActiveStock = (stockCode: string) => {
    if (watchList.has(stockCode)) {
      activeStockCode.value = stockCode
      // If the detailed data hasn't been loaded yet, fetch it.
      if (watchList.get(stockCode)?.kline.length === 0) {
        fetchLatestData(stockCode)
      }
    }
  }

  /**
   * 获取最新的股票数据 (K线和指标)
   * @param stockCode - 股票代码
   */
  const fetchLatestData = async (stockCode: string) => {
    const stock = watchList.get(stockCode)
    if (!stock) return

    try {
      // Use the same advanced fetcher as the wizard, but with default options.
      const defaultConfig = {
        klineDays: 100,
        maLines: [5, 10, 20],
        indicators: ['macd'],
        fetchNews: true
      }
      const fetchedData = await window.api.invoke('stock:fetch-advanced', stockCode, defaultConfig)

      if (fetchedData) {
        stock.kline = fetchedData.kline
        stock.indicators = fetchedData.indicators
        stock.news = fetchedData.news
        stock.lastUpdateTime = fetchedData.lastUpdateTime
      } else {
        throw new Error('Received null data from main process')
      }
    } catch (error) {
      console.error(`Failed to fetch latest data for ${stockCode}:`, error)
      // Here you could add a user-facing error message.
    }
  }

  /**
   * 运行 AI 分析 (目前为空)
   * @param stockCode - 股票代码
   */
  const runAIAnalysis = (stockCode: string) => {
    console.log(`AI analysis for ${stockCode} is triggered.`)
    // The actual logic will be handled in the component, which will call the main process.
  }

  return {
    watchList,
    activeStockCode,
    addStockWithOptions,
    removeStock,
    setActiveStock,
    fetchLatestData,
    runAIAnalysis
  }
})
