import axios from 'axios'
export const searchStock = async (keyword) => {
  if (!keyword) {
    console.error('请输入搜索关键字')
    return []
  }
  // 东方财富的搜索建议接口 URL
  const url = `http://searchapi.eastmoney.com/api/suggest/get`

  // function getMarketName(marketType) {
  //   switch (marketType) {
  //     case 1:
  //       return '深圳'
  //     case 2:
  //       return '上海'
  //     case 4:
  //       return '香港'
  //     case 113:
  //       return '美国'
  //     default:
  //       return '其他'
  //   }
  // }

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
      const result = stockList
        // .filter((item) => item.SecurityType === 1) // SecurityType: 1 代表股票
        .map((item) => ({
          code: item.Code,
          name: item.Name,
          // market: getMarketName(item.MarketType), // 将市场类型转换为可读名称
          type: item.SecurityTypeName // e.g., "股票"
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
