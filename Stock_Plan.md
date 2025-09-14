好的，非常棒的架构概述！你的项目结构清晰，设计模式运用得当，这为添加新功能打下了坚实的基础。在现有架构上集成股票分析功能，可以看作是添加一个新的 `feature` 模块。

下面，我将基于你现有的架构模式，为你规划具体的开发流程、周期和实现步骤。

---

### **新增功能：股票分析模块 (Stock Analysis Module)**

这个新模块将完美地融入你现有的 `src/main/features/` 结构中，并复用 `ai-service` 等现有服务。

#### **架构集成方案**

1.  **创建新模块**: 在 `src/main/features/` 目录下创建一个新文件夹 `stock-analysis`。
2.  **模块内分层**: 在 `stock-analysis` 文件夹内，我们将遵循你已有的模式，创建以下文件：
    - `stock-analysis.service.ts`: 负责所有核心业务逻辑，包括数据爬取、技术指标计算、Prompt 组装、调用 AI 服务等。
    - `stock-analysis.handler.ts`: 负责处理从渲染进程发来的 IPC 请求（如 `stock:analyze`, `stock:query`），调用 `StockAnalysisService` 并返回结果。
    - `stock-analysis.types.ts`: 定义此模块所需的所有 TypeScript 类型，例如 `StockData`, `TechnicalIndicators`, `AnalysisResult` 等。
3.  **服务复用**: 新的 `StockAnalysisService` 将会依赖并调用现有的 `AIService`，实现业务逻辑与 AI 能力的解耦。

---

### **开发流程**

我们将采用一个迭代式的开发流程，确保每一步都有明确的产出和验证。

**阶段一：技术选型与原型验证 (Spike)**

- **目标**: 验证核心技术的可行性，选择合适的数据源和库。
- **任务**:
  1.  调研并选择一个可靠的股票数据源 API。免费的（如 [yahoo-finance2](https://www.npmjs.com/package/yahoo-finance2)) 或付费的（如 Alpha Vantage, Tushare）都可以，先用免费的进行原型开发。
  2.  调研并选择一个技术指标计算库，例如 [technicalindicators](https://www.npmjs.com/package/technicalindicators)。
  3.  编写一个简单的 Node.js 脚本，验证能否成功获取某只股票的 K 线数据并计算出 MACD 和 KDJ。

**阶段二：模块设计与接口定义**

- **目标**: 定义好模块的内部结构和与前端的通信协议。
- **任务**:
  1.  在 `stock-analysis.types.ts` 中定义所有数据结构。
  2.  设计 `StockAnalysisService` 的公共方法接口，如 `analyzeStock(stockName: string): Promise<AnalysisResult>` 和 `queryAnalysis(context: AnalysisContext, question: string): Promise<string>`。
  3.  定义与前端通信的 IPC Channel 名称和数据格式，如 `stock:start-analysis`, `stock:analysis-progress`, `stock:analysis-complete`, `stock:ask-question`。

**阶段三：核心功能开发 (后端)**

- **目标**: 实现 `StockAnalysisService` 中的所有核心逻辑。
- **任务**:
  1.  数据获取：实现从选定的 API 获取股票代码、K线、成交量、新闻、公告等数据的功能。
  2.  指标计算：使用技术指标库，根据获取的 K 线数据计算 MACD, KDJ, RSI, BOLL, 均线等。
  3.  信息整合：编写一个函数，将所有获取到的原始数据和计算出的指标，整合成一个结构化的、易于阅读的文本摘要（Summary Document）。**这是喂给 AI 的关键一步**。
  4.  AI 分析：调用现有的 `ai-service`，将上述文本摘要作为 Prompt 发送给大模型，获取初步的分析报告。
  5.  AI 问答：实现一个支持上下文的问答函数，将初步分析报告和用户问题一起发送给大模型。

**阶段四：IPC 通信与前端集成**

- **目标**: 将后端能力暴露给前端，并联调。
- **任务**:
  1.  实现 `stock-analysis.handler.ts`，处理前端请求，调用 Service，并处理错误。
  2.  在主进程入口文件 (`src/main/index.ts`) 中注册新的 handlers。
  3.  (前端工作) 开发股票分析功能的 UI 界面，包括输入框、分析按钮、结果展示区和问答对话框。
  4.  (前端工作) 调用 `ipcRenderer` 发送请求并监听后端返回的结果。

**阶段五：测试与优化**

- **目标**: 确保功能的稳定性和性能。
- **任务**:
  1.  为 `StockAnalysisService` 中的核心计算函数编写单元测试。
  2.  进行完整的端到端测试，模拟用户操作。
  3.  优化 Prompt，提高 AI 分析的准确性和质量。
  4.  处理网络请求慢或失败的异常情况，给前端明确的反馈。

---

### **开发周期估算**

假设由一位熟悉项目架构的开发者全职投入，这是一个相对合理的估算：

- **阶段一 (技术选型与原型验证)**: **2-3 天**
  - 调研和选择库需要时间，并快速验证其是否满足基本需求。
- **阶段二 (模块设计与接口定义)**: **1-2 天**
  - 定义好接口是后续高效开发的基础。
- **阶段三 (核心功能开发)**: **5-7 天**
  - 这是工作量最大的部分，涉及多个数据源的集成和复杂的逻辑处理。
- **阶段四 (IPC 通信与前端集成)**: **2-3 天**
  - 主要为联调工作，取决于前后端接口定义的清晰度。
- **阶段五 (测试与优化)**: **2-3 天**
  - 测试和根据结果调整 Prompt 是保证质量的关键。

**总计：约 12 - 18 个工作日**

这个估算未包含前端 UI 开发的全部时间，主要集中在后端逻辑和集成上。

---

### **具体实现步骤 (代码层面)**

**Step 1: 环境准备**

```bash
npm install yahoo-finance2 technicalindicators
```

**Step 2: 创建模块文件结构**

```
src/main/features/
└── stock-analysis/
    ├── stock-analysis.handler.ts
    ├── stock-analysis.service.ts
    └── stock-analysis.types.ts
```

**Step 3: 定义类型 (`stock-analysis.types.ts`)**

```typescript
// stock-analysis.types.ts

// K线数据单元
export interface KlineData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// 技术指标
export interface TechnicalIndicators {
  macd: any[] // 具体类型取决于库的返回
  kdj: any[]
  rsi: any
  boll: any[]
  movingAverages: { ma5: number[]; ma10: number[]; ma20: number[] }
}

// AI分析结果
export interface AnalysisResult {
  summaryDocument: string // 给AI的原始总结文档
  aiAnalysisReport: string // AI生成的分析报告
  context: any // 用于后续对话的上下文
}
```

**Step 4: 实现核心服务 (`stock-analysis.service.ts`)**

```typescript
// stock-analysis.service.ts
import yahooFinance from 'yahoo-finance2'
import * as ti from 'technicalindicators'
import { AIService } from '../ai/ai-service' // 假设你的AI服务路径
import { KlineData, TechnicalIndicators, AnalysisResult } from './stock-analysis.types'

export class StockAnalysisService {
  private aiService: AIService

  constructor() {
    // 实例化或获取已有的AI服务实例
    this.aiService = new AIService()
  }

  // 主分析函数
  public async analyzeStock(stockName: string): Promise<AnalysisResult> {
    // 1. 获取股票代码 (此处简化，实际可能需要一个搜索接口)
    const stockCode = await this.getStockCode(stockName)
    if (!stockCode) throw new Error('无法找到该股票代码')

    // 2. 获取20日K线和量能数据
    const klineData = await this.fetchKLineData(stockCode, 40) // 获取更多数据以计算指标

    // 3. 计算技术指标
    const indicators = this.calculateIndicators(klineData)

    // 4. 获取新闻和公告 (此部分实现可能较复杂，可先用占位符)
    const news = '近期市场热点为人工智能领域，该公司发布了新的AI芯片公告...'

    // 5. 生成总结文档 (关键！)
    const summaryDocument = this.generateSummaryPrompt(
      stockCode,
      klineData.slice(-20),
      indicators,
      news
    )

    // 6. 调用AI进行分析
    const aiConfig = { provider: 'openai', model: 'gpt-4' } // 从用户配置中读取
    const aiAnalysisReport = await this.aiService.generateCommitMessage(summaryDocument, aiConfig) // 复用或新增一个通用方法

    return {
      summaryDocument,
      aiAnalysisReport,
      context: [
        // 初始上下文
        { role: 'user', content: summaryDocument },
        { role: 'assistant', content: aiAnalysisReport }
      ]
    }
  }

  // 后续问答函数
  public async queryAnalysis(
    context: any[],
    question: string
  ): Promise<{ answer: string; newContext: any[] }> {
    const newContext = [...context, { role: 'user', content: question }]
    const aiConfig = { provider: 'openai', model: 'gpt-4' } // 从用户配置中读取
    // ai-service需要支持传入上下文的对话功能
    const answer = await this.aiService.chatWithContext(newContext, aiConfig)

    return { answer, newContext: [...newContext, { role: 'assistant', content: answer }] }
  }

  private async getStockCode(name: string): Promise<string | null> {
    // 简单实现，例如：腾讯 -> 0700.HK
    if (name.includes('腾讯')) return '0700.HK'
    // 实际项目中，这里应该调用一个搜索API
    const searchResults = await yahooFinance.search(name)
    return searchResults.quotes[0]?.symbol || null
  }

  private async fetchKLineData(code: string, days: number): Promise<KlineData[]> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    const results = await yahooFinance.historical(code, {
      period1: startDate,
      period2: endDate
    })
    return results.map((r) => ({ ...r, date: r.date.toISOString().split('T')[0] }))
  }

  private calculateIndicators(data: KlineData[]): TechnicalIndicators {
    const closes = data.map((d) => d.close)
    const highs = data.map((d) => d.high)
    const lows = data.map((d) => d.low)

    const macd = new ti.MACD({
      values: closes,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false
    }).getResult()
    // ... 计算 KDJ, RSI, BOLL 等

    return {
      macd: macd.slice(-20),
      // ... 其他指标
      movingAverages: {
        ma5: ti.SMA.calculate({ period: 5, values: closes }).slice(-20),
        ma10: ti.SMA.calculate({ period: 10, values: closes }).slice(-20),
        ma20: ti.SMA.calculate({ period: 20, values: closes }).slice(-20)
      }
    }
  }

  private generateSummaryPrompt(
    code: string,
    kline: KlineData[],
    indicators: TechnicalIndicators,
    news: string
  ): string {
    return `
      请基于以下信息，为股票 ${code} 生成一份详细的技术面和基本面结合的分析报告。

      **近期市场热点与新闻:**
      ${news}

      **最近20日K线数据:**
      ${JSON.stringify(kline, null, 2)}

      **核心技术指标:**
      - **MACD**: ${JSON.stringify(indicators.macd.slice(-5))}
      - **均线**: 最近一日 MA5: ${indicators.movingAverages.ma5.slice(-1)[0]}, MA10: ${indicators.movingAverages.ma10.slice(-1)[0]}, MA20: ${indicators.movingAverages.ma20.slice(-1)[0]}
      
      请从以下几个方面进行分析：
      1. 当前股价趋势和关键支撑/压力位。
      2. 量价关系分析。
      3. 基于技术指标（MACD、均线等）的买卖信号。
      4. 结合新闻和市场热点，判断其潜在影响。
      5. 给出综合性的投资建议（看涨、看跌、震荡）和风险提示。
    `
  }
}
```

**Step 5: 实现处理器 (`stock-analysis.handler.ts`)**

```typescript
// stock-analysis.handler.ts
import { ipcMain } from 'electron'
import { StockAnalysisService } from './stock-analysis.service'

const stockService = new StockAnalysisService()

export function registerStockAnalysisHandlers() {
  ipcMain.handle('stock:analyze', async (_, stockName: string) => {
    try {
      const result = await stockService.analyzeStock(stockName)
      return { success: true, data: result }
    } catch (error) {
      console.error('Stock analysis failed:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('stock:query', async (_, { context, question }) => {
    try {
      const result = await stockService.queryAnalysis(context, question)
      return { success: true, data: result }
    } catch (error) {
      console.error('Stock query failed:', error)
      return { success: false, error: (error as Error).message }
    }
  })
}
```

**Step 6: 在主进程中注册 Handler**

```typescript
// src/main/index.ts
// ... 其他 import
import { registerStockAnalysisHandlers } from './features/stock-analysis/stock-analysis.handler'

// ... app.whenReady() 中
app.whenReady().then(() => {
  // ...
  registerGitScanHandlers()
  registerAiHandlers()
  registerExportHandlers()
  registerStockAnalysisHandlers() // 新增注册
  // ...
})
```

通过以上步骤，你就可以在你强大而清晰的架构中，系统性地添加这个全新的股票分析功能了。
