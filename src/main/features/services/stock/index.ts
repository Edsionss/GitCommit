import axios from 'axios'
import { SMA, MACD, RSI, BollingerBands, Stochastic } from 'technicalindicators'
import { executeScrapingTask } from '@services/puppeteer'

export const searchStock = async (keyword) => {
  if (!keyword) {
    console.error('请输入搜索关键字')
    return []
  }
  console.log(await getStockBasicInfo('600519'))

  // 东方财富的搜索建议接口 URL
  const url = `http://searchapi.eastmoney.com/api/suggest/get`
  try {
    const response = await axios.get(url, {
      params: {
        // type: 14 表示综合搜索（股票、基金等），这里我们主要关注股票
        // input: `${encodeURIComponent(keyword)}`, // 关键字需要 URL 编码
        input: keyword, // axios 会自动处理 URL 编码
        type: '14',
        token: 'D433A5995513408E836928508F454F7C', // 这个 token 似乎是固定的
        count: 10 // 返回最多10条结果
      },
      // 伪装成浏览器请求，避免被屏蔽
      headers: {
        Referer: 'http://quote.eastmoney.com/',
        Host: 'searchapi.eastmoney.com'
      }
    })

    // 检查返回数据结构
    if (
      response.data &&
      response.data.QuotationCodeTable &&
      response.data.QuotationCodeTable.Data
    ) {
      const stockList = response.data.QuotationCodeTable.Data

      // Classify = 'AStock'
      // Code = '002370'
      // ID = '0023702'
      // InnerCode = '27833008251510'
      // JYS = '6'
      // MarketType = '2'
      // MktNum = '0'
      // Name = '亚太药业'
      // PinYin = 'YTYY'
      // QuoteID = '0.002370'
      // SecurityType = '2'
      // SecurityTypeName = '深A'
      // TypeUS = '6'
      // UnifiedCode = '002370'

      // 过滤和格式化结果，我们只关心股票
      const result = stockList.map((item) => ({
        ...item,
        code: item.Code,
        name: item.Name,
        market: item.SecurityTypeName
      }))
      return result
    } else {
      return []
    }
  } catch (error) {
    console.error('查询股票时出错:', error?.message)
    return []
  }
}
/**
 * 根据股票代码判断是上海(1)还是深圳(0)市场
 * @param {string} code - 6位股票代码
 * @returns {string} '1' for SH, '0' for SZ
 */
function getMarketCode(code) {
  // 6开头是沪市，0、3开头是深市
  if (code.startsWith('6')) {
    return '1'
  } else if (code.startsWith('0') || code.startsWith('3')) {
    return '0'
  }
  // 其他情况（如港股、美股）可以后续扩展
  return '1' // 默认
}

/**
 *  获取股票的日K线数据
 * @param {string} code - 6位股票代码
 * @param {number} days - 获取最近的天数
 * @returns {Promise<Array<object>>} K线数据数组
 */
export const fetchKLineData = async (code: string, days: number): Promise<any[]> => {
  const marketCode = getMarketCode(code)
  const secid = `${marketCode}.${code}`

  // 东方财富历史K线数据接口
  const url = 'http://push2his.eastmoney.com/api/qt/stock/kline/get'
  try {
    const response = await axios.get(url, {
      params: {
        secid: secid,
        klt: 101, // 101代表日K
        fqt: 1, // 1代表前复权
        lmt: days, // 获取的数据条数
        end: '20500101', // 一个未来的日期，确保获取到最近的数据
        fields1: 'f1,f2,f3,f4,f5,f6',
        fields2: 'f51,f52,f53,f54,f55,f56,f57,f58'
      },
      headers: {
        // 伪装成浏览器请求
        Referer: 'http://quote.eastmoney.com/'
      }
    })

    const data = response.data.data
    if (!data || !data.klines) {
      console.error('未能获取到K线数据，请检查股票代码是否正确。')
      return []
    }

    // 解析返回的字符串数据
    const parsedData = data.klines.map((klineString) => {
      const parts = klineString.split(',')
      return {
        date: parts[0],
        open: parseFloat(parts[1]),
        close: parseFloat(parts[2]),
        high: parseFloat(parts[3]),
        low: parseFloat(parts[4]),
        volume: parseFloat(parts[5]), // 成交量
        amount: parseFloat(parts[6]) // 成交额
      }
    })

    return parsedData
  } catch (error) {
    console.error('获取K线数据时出错:', error?.message)
    return []
  }
}

/**
 *  计算技术指标
 * @param {Array<object>} klineData - K线数据数组
 * @returns {Array<object>} 带有技术指标的K线数据数组
 */
export function calculateIndicators(klineData: any[]) {
  if (klineData.length === 0) return []

  // 提取收盘价用于计算
  const closePrices = klineData.map((d) => d.close)

  // ---- 计算均线 (MA) ----
  const ma5 = SMA.calculate({ period: 5, values: closePrices })
  const ma10 = SMA.calculate({ period: 10, values: closePrices })
  const ma20 = SMA.calculate({ period: 20, values: closePrices })

  // ---- 计算 MACD ----
  const macdInput = {
    values: closePrices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  }
  const macdResult = MACD.calculate(macdInput)

  // 将计算结果合并回原始数据
  // 注意：指标计算需要一定前期数据，所以数组前面的部分会没有指标值
  const dataWithIndicators = klineData.map((d, index) => {
    // 补齐均线数据，因为前N-1天是没有均线的
    const maOffset5 = index - 4
    const maOffset10 = index - 9
    const maOffset20 = index - 19

    // 补齐MACD数据
    const macdOffset = index - (macdInput.slowPeriod - 1) // MACD结果的起始位置

    return {
      ...d,
      ma5: maOffset5 >= 0 ? ma5[maOffset5] : null,
      ma10: maOffset10 >= 0 ? ma10[maOffset10] : null,
      ma20: maOffset20 >= 0 ? ma20[maOffset20] : null,
      macd: macdOffset >= 0 ? macdResult[macdOffset] : null
      // 成交量本来就有，无需计算
    }
  })

  return dataWithIndicators
}

/**
 *  获取股票相关资讯
 * @param {string} code - 6位股票代码
 * @returns {Promise<Array<object>>} 新闻列表
 */
export async function fetchNews(code: string, name: string) {
  const dom = executeScrapingTask(`https://www.cls.cn/telegraph`, (): any => {
    console.log(window.document)
    return window.document.body.innerText
  })

  return dom
  const marketCode = getMarketCode(code)
  const stockWithMarket = `${code}${marketCode === '1' ? 'SH' : 'SZ'}`

  // const url = `https://np-c-pc-api.eastmoney.com/api/NphInfolist/GetInfoList`

  const url = `https://search-api-web.eastmoney.com/search/jsonp`

  const cbName = `jQuery${Date.now()}${Math.floor(Math.random() * 10000000000000000)}`

  const paramObj = {
    uid: '', // 截图显示为空，我们保持为空
    keyword: name, // 使用股票名称
    type: ['cmsArticleWebOld'], // 精确复制这个数组
    client: 'web',
    clientType: 'web',
    clientVersion: 'curr',
    param: {
      // 注意这里是嵌套的 param 字段
      cmsArticleWebOld: {
        searchScope: 'default',
        sort: 'default',
        pageIndex: 1,
        pageSize: 300,
        preTag: '<em >', // 保持截图中的 HTML 标签
        postTag: '</em>'
      }
    }
  }

  const encodedParam = encodeURIComponent(JSON.stringify(paramObj))
  try {
    // const response = await axios.get(url, {
    //   params: {
    //     name: 'news',
    //     code: stockWithMarket,
    //     pagesize: 10,
    //     page: 1,
    //     cb: `jQuery_guba_${Date.now()}` // 动态生成cb
    //   },
    //   headers: {
    //     'User-Agent':
    //       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    //     // 构造一个合法的Referer，这个URL是浏览器访问股吧新闻时的地址
    //     Referer: `https://guba.eastmoney.com/list,${stockWithMarket},f.html`
    //   }
    // })

    // return response

    // 返回的数据是 JSONP 格式 "callback({...})"，需要提取JSON部分
    const jsonData = JSON.parse(response.data.replace(/^callback\(|\)$/g, ''))
    if (jsonData && jsonData.data && jsonData.data.list) {
      return jsonData.data.list.map((item) => ({
        title: item.title,
        time: new Date(item.show_time * 1000).toLocaleString(),
        url: item.url
      }))
    }
    return []
  } catch (error) {
    console.error('获取新闻资讯时出错:', error?.message)
    return []
  }
}

export async function getStockInfoByCode(code: string, name?: string) {
  if (!code || code.length !== 6) {
    return '输入的股票代码无效'
  }
  // 1. 获取K线数据
  const klineData = await fetchKLineData(code, 100)
  if (klineData.length === 0) return

  // 2. 计算指标
  const dataWithIndicators = calculateIndicators(klineData)

  // 3. 获取新闻
  const news = await fetchNews(code, name || '')

  return { klineData, indicators: dataWithIndicators, news }
}

/**
 * 根据股票代码从东方财富获取基本信息。
 * @param {string} stockCode 6位股票代码，如 '600519'
 * @returns {Promise<object|null>} 包含所需信息的对象，或在失败时返回 null
 */
async function getStockBasicInfo(stockCode) {
  // 1. 根据股票代码前缀判断市场，并构造东方财富所需的 secid
  let secid
  let marketName

  if (stockCode.startsWith('6')) {
    secid = `1.${stockCode}`
    marketName = 'SH' // 上海
  } else if (stockCode.startsWith('0') || stockCode.startsWith('3')) {
    secid = `0.${stockCode}`
    marketName = 'SZ' // 深圳
  } else if (stockCode.startsWith('8') || stockCode.startsWith('4')) {
    secid = `0.${stockCode}`
    marketName = 'BJ' // 北京
  } else {
    console.error(`未知的股票代码前缀: ${stockCode}`)
    return null
  }

  // 2. 构造请求URL和参数
  // f57:代码, f58:名称, f120:公司简介, f124:上市日期, f127:所属行业, f128:所属板块/概念
  const fields = 'f57,f58,f120,f124,f127,f128'
  const url = `http://push2.eastmoney.com/api/qt/stock/get`
  const params = {
    secid: secid,
    fields: fields,
    // 添加一个时间戳参数防止缓存
    _: Date.now()
  }

  // 模拟浏览器的 User-Agent，防止被屏蔽
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }

  try {
    // 3. 发送GET请求
    const response = await axios.get(url, { params, headers })
    console.log(response)

    const data = response.data
    if (!data || !data.data) {
      console.error(`未能获取到股票 ${stockCode} 的有效数据。`)
      return null
    }

    const stockData = data.data

    // 4. 整理数据以匹配您的数据库 schema
    const listDateNum = stockData.f124
    let formattedDate: string | null = null
    if (listDateNum) {
      const dateStr = String(listDateNum)
      formattedDate = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`
    }

    const result = {
      company_name: stockData.f58,
      market: `${marketName}.${stockData.f57}`, // 构造市场代码，如 SH.600519
      company_profile: stockData.f120,
      industry_name: stockData.f127, // 这是行业名称，需要您自己映射到ID
      sector_names: stockData.f128, // 这是板块名称列表(字符串)，需要您自己映射到ID
      list_date: formattedDate
    }

    return result
  } catch (error) {
    console.error(`请求股票 ${stockCode} 数据时发生错误:`, error.message)
    return null
  }
}
