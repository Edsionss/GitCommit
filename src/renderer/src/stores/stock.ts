import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

// 假设的 v-chart K线数据格式
type KlineDataItem = [string, number, number, number, number, number] // [时间, 开, 高, 低, 收, 成交量]

interface StockData {
  code: string
  name: string
  kline: KlineDataItem[]
  indicators: Record<string, any>
  news: string[]
  lastUpdateTime: string
  analysisHistory: { prompt: string; report: string; time: Date }[]
}

// 从 localStorage 加载持久化的数据
const loadWatchListFromStorage = (): Map<string, StockData> => {
  const stored = localStorage.getItem('stock_watchList')
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as { code: string; name: string }[]
      const watchList = new Map<string, StockData>()
      parsed.forEach((item) => {
        // 初始化时只加载基本信息，详细数据后续获取
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
  const simplified = Array.from(watchList.values()).map(({ code, name }) => ({ code, name }))
  localStorage.setItem('stock_watchList', JSON.stringify(simplified))
}


import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

// 假设的 v-chart K线数据格式
type KlineDataItem = [string, number, number, number, number, number] // [时间, 开, 高, 低, 收, 成交量]

interface StockData {
  code: string
  name: string
  kline: KlineDataItem[]
  indicators: Record<string, any>
  news: string[]
  lastUpdateTime: string
  analysisHistory: { prompt: string; report: string; time: Date }[]
}

interface StockFetchConfig {
    klineDays: number;
    maLines: number[];
    indicators: string[];
    fetchNews: boolean;
}

// 从 localStorage 加载持久化的数据
const loadWatchlistFromStorage = (): Map<string, StockData> => {
  const stored = localStorage.getItem('stock_watchlist')
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as { code: string; name: string }[]
      const watchlist = new Map<string, StockData>()
      parsed.forEach((item) => {
        // 初始化时只加载基本信息，详细数据后续获取
        watchlist.set(item.code, {
          ...item,
          kline: [],
          indicators: {},
          news: [],
          lastUpdateTime: '',
          analysisHistory: []
        })
      })
      return watchlist
    } catch (error) {
      console.error('Failed to parse watchlist from localStorage', error)
      return new Map()
    }
  }
  return new Map()
}

// 持久化 watchlist 到 localStorage
const saveWatchlistToStorage = (watchlist: Map<string, StockData>) => {
  const simplified = Array.from(watchlist.values()).map(({ code, name }) => ({ code, name }))
  localStorage.setItem('stock_watchlist', JSON.stringify(simplified))
}

export const useStockStore = defineStore('stock', () => {
  // --- State ---
  const watchlist = reactive<Map<string, StockData>>(loadWatchlistFromStorage())
  const activeStockCode = ref<string | null>(null)

  // --- Actions ---

  /**
   * (简单版本) 添加股票到自选列表
   * @param stockName - 股票名称或代码
   */
  const addStock = async (stockName: string) => {
    // 模拟后端返回
    const stockInfo = {
      code: stockName.startsWith('sh') ? stockName : `sz${Math.floor(Math.random() * 1000000)}`,
      name: `${stockName}-模拟`
    }

    if (watchlist.has(stockInfo.code)) {
      alert('该股票已在自选列表中')
      return
    }

    const newStock: StockData = {
      ...stockInfo,
      kline: [],
      indicators: {},
      news: [],
      lastUpdateTime: '',
      analysisHistory: []
    }

    watchlist.set(stockInfo.code, newStock)
    saveWatchlistToStorage(watchlist)
    await fetchLatestData(stockInfo.code)
  }

  /**
   * (高级版本) 根据配置添加股票并获取数据
   * @param stockInfo - 股票基本信息
   * @param config - 获取数据的配置
   */
  const addStockWithOptions = async (stockInfo: { code: string; name: string }, config: StockFetchConfig) => {
    if (watchlist.has(stockInfo.code)) {
      alert('该股票已在自选列表中');
      return;
    }

    console.log(`Fetching data for ${stockInfo.name} with config:`, config);
    // TODO: 在此调用真实的IPC接口，并传递config
    // const { klineData, indicators, news } = await window.api.invoke('stock:fetch-advanced', stockInfo.code, config);

    // --- 模拟数据 --- 
    await new Promise(resolve => setTimeout(resolve, 1500)); // 模拟网络延迟
    const klineData: KlineDataItem[] = Array.from({ length: config.klineDays }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - config.klineDays + i);
        const open = Math.random() * 10 + 100;
        const close = open + (Math.random() - 0.5) * 5;
        const high = Math.max(open, close) + Math.random() * 2;
        const low = Math.min(open, close) - Math.random() * 2;
        const volume = Math.random() * 1000000;
        return [date.toISOString().split('T')[0], open, high, low, close, volume];
    });
    const indicators = {};
    config.maLines.forEach(ma => {
        indicators[`MA${ma}`] = klineData.map(d => d[4]).slice(-ma).reduce((a, b) => a + b, 0) / ma;
    });
    const news = config.fetchNews ? [`${stockInfo.name}的模拟新闻1`, `${stockInfo.name}的模拟新闻2`] : [];
    // --- 模拟结束 ---

    const newStock: StockData = {
      ...stockInfo,
      kline: klineData,
      indicators: indicators,
      news: news,
      lastUpdateTime: new Date().toISOString(),
      analysisHistory: []
    };

    watchlist.set(stockInfo.code, newStock);
    saveWatchlistToStorage(watchlist);
  };


  /**
   * 从自选列表删除股票
   * @param stockCode - 股票代码
   */
  const removeStock = (stockCode: string) => {
    if (watchlist.has(stockCode)) {
      watchlist.delete(stockCode)
      saveWatchlistToStorage(watchlist)
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
    if (watchlist.has(stockCode)) {
      activeStockCode.value = stockCode
      // 如果没有数据，则获取最新数据
      if (watchlist.get(stockCode)?.kline.length === 0) {
        fetchLatestData(stockCode)
      }
    }
  }

  /**
   * 获取最新的股票数据 (K线和指标)
   * @param stockCode - 股票代码
   */
  const fetchLatestData = async (stockCode: string) => {
    const stock = watchlist.get(stockCode)
    if (!stock) return

    try {
      // 模拟调用 IPC 接口
      // const klineData = await window.api.invoke('stock:fetch-data', stockCode);
      // const indicators = await window.api.invoke('stock:calculate-indicators', klineData);

      // 模拟返回的数据
      const klineData: KlineDataItem[] = Array.from({ length: 100 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - 100 + i)
        const open = Math.random() * 10 + 100
        const close = open + (Math.random() - 0.5) * 5
        const high = Math.max(open, close) + Math.random() * 2
        const low = Math.min(open, close) - Math.random() * 2
        const volume = Math.random() * 1000000
        return [date.toISOString().split('T')[0], open, high, low, close, volume]
      })
      const indicators = {
        MA5: klineData.map((d) => d[4]).slice(-5).reduce((a, b) => a + b, 0) / 5,
        MA10: klineData.map((d) => d[4]).slice(-10).reduce((a, b) => a + b, 0) / 10,
        MA20: klineData.map((d) => d[4]).slice(-20).reduce((a, b) => a + b, 0) / 20,
      }


      stock.kline = klineData
      stock.indicators = indicators
      stock.lastUpdateTime = new Date().toISOString()
    } catch (error) {
      console.error(`Failed to fetch latest data for ${stockCode}:`, error)
      // 这里可以添加错误提示
    }
  }

  /**
   * 运行 AI 分析 (目前为空)
   * @param stockCode - 股票代码
   */
  const runAIAnalysis = (stockCode: string) => {
    console.log(`AI analysis for ${stockCode} is triggered.`)
    // 具体逻辑将在组件中处理
  }

  return {
    watchlist,
    activeStockCode,
    addStock,
    addStockWithOptions,
    removeStock,
    setActiveStock,
    fetchLatestData,
    runAIAnalysis
  }
})

