# AI 智能股票分析功能 - 开发计划文档

## 1. 目标

在 CognitoOcean 应用中集成 AI 功能，实现对股票市场的智能化分析。用户可以通过自然语言下达指令（例如“分析一下最近一周特斯拉的股价趋势和关键指标”），AI 能自动调用应用内已有的数据接口获取所需数据，并生成分析报告。

## 2. 核心技术方案：Function Calling / Tool Use

我们将采用大语言模型（LLM）的 **Function Calling** 模式。此方案能将 AI 的理解能力与我们本地的数据能力完美结合。

**工作流程如下:**

1.  **用户 (前端)**: 输入分析指令。
2.  **应用后端**: 将指令和一份“可用工具清单”发送给 AI (例如 Gemini)。
3.  **AI**: 理解指令，并判断需要调用哪个或哪些工具（例如 `getHistoricalData`）。它会返回一个结构化的函数调用请求。
4.  **应用后端**: 解析 AI 的响应，执行本地对应的函数（例如调用 `StockService.getHistoricalData`）。
5.  **应用后端**: 将本地函数的执行结果再次发送给 AI。
6.  **AI**: 收到数据后，进行汇总分析，并生成最终的自然语言报告。
7.  **应用后端 -> 前端**: 将最终报告返回给前端展示。

![Function Calling Flow](https://developer.google.com/static/vertex-ai/docs/generative-ai/images/function-calling-flow-diagram.png)

## 3. 详细开发步骤

### 第一步：后端 - 定义 AI 可用工具集 (StockService)

我们需要将现有的股票数据获取能力，封装成一个个独立的、语义清晰的函数，作为提供给 AI 的“工具”。

**文件位置**: `src/main/features/services/stock/index.ts`

**需要封装或确认存在的函数**:

```typescript
// src/main/features/services/stock/index.ts

/**
 * 获取指定股票代码在特定日期范围内的历史K线数据。
 * @param symbol - 股票代码，例如 'AAPL'。
 * @param startDate - 开始日期，格式 'YYYY-MM-DD'。
 * @param endDate - 结束日期，格式 'YYYY-MM-DD'。
 * @returns 返回包含每日开、高、低、收、成交量等数据的数组。
 */
export async function getHistoricalData(symbol: string, startDate: string, endDate: string): Promise<any[]> {
  // ... 已有的实现逻辑
}

/**
 * 获取一支或多支股票的最新报价信息。
 * @param symbols - 股票代码数组，例如 ['AAPL', 'TSLA']。
 * @returns 返回包含最新价格、涨跌幅等信息的对象。
 */
export async function getQuote(symbols: string[]): Promise<any> {
  // ... 已有的实现逻辑
}

/**
 * 计算指定数据的简单移动平均线 (SMA)。
 * @param data - 历史数据数组，每个元素需要有 'close' 字段。
 * @param period - 计算周期，例如 5, 10, 20。
 * @returns 返回计算好的 SMA 数据数组。
 */
export async function calculateSMA(data: any[], period: number): Promise<number[]> {
  // ... 实现或调用已有的技术指标计算逻辑
}

/**
 * 计算指定数据的相对强弱指数 (RSI)。
 * @param data - 历史数据数组，每个元素需要有 'close' 字段。
 * @param period - 计算周期，例如 14。
 * @returns 返回计算好的 RSI 数据数组。
 */
export async function calculateRSI(data: any[], period: number): Promise<number[]> {
  // ... 实现或调用已有的技术指标计算逻辑
}

// 可以根据需要继续添加其他工具，例如 MACD, BOLL 等。
```

### 第二步：后端 - 创建 AI 分析服务 (AIStockAnalysisService)

这是整个功能的核心，负责编排 AI 与本地工具的交互流程。

**创建新文件**: `src/main/features/services/ai/AIStockAnalysisService.ts`

```typescript
// src/main/features/services/ai/AIStockAnalysisService.ts

import { GoogleGenerativeAI } from '@google/genai'
import * as StockService from '@services/stock'

// 从配置中获取 API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// 1. 定义工具集，这里的函数名需要和 StockService 中的函数名完全对应
const tools = [
  {
    functionDeclarations: [
      {
        name: 'getHistoricalData',
        description: "获取指定股票代码在特定日期范围内的历史K线数据。",
        parameters: {
          type: 'OBJECT',
          properties: {
            symbol: { type: 'STRING', description: "股票代码，例如 'AAPL'" },
            startDate: { type: 'STRING', description: "开始日期，格式 'YYYY-MM-DD'" },
            endDate: { type: 'STRING', description: "结束日期，格式 'YYYY-MM-DD'" },
          },
          required: ['symbol', 'startDate', 'endDate'],
        },
      },
      {
        name: 'getQuote',
        description: "获取一支或多支股票的最新报价信息。",
        parameters: {
            // ... 定义参数
        }
      },
      // ... 定义其他工具
    ],
  },
]

// 2. 创建模型实例，并绑定工具
const model = genAI.getGenerativeModel({
  model: 'gemini-pro', // 根据需要选择模型
  tools: tools,
})

// 3. 编排服务主函数
export async function analyzeMarket(prompt: string): Promise<string> {
  const chat = model.startChat()
  const result = await chat.sendMessage(prompt)
  let response = result.response

  // 循环处理函数调用
  while (response.functionCalls) {
    const functionCalls = response.functionCalls

    // 并行执行所有函数调用
    const toolExecutionResults = await Promise.all(
      functionCalls.map(async (call) => {
        const { name, args } = call
        console.log(`AI requests to call function: ${name} with args:`, args)

        // 在这里查找并执行本地函数
        if (StockService[name]) {
          try {
            const executionResult = await StockService[name](...Object.values(args))
            return {
              functionResponse: {
                name,
                response: { result: executionResult },
              },
            }
          } catch (error) {
            // ... 错误处理
          }
        }
        // ... 如果函数不存在的处理
      })
    )

    // 将执行结果返回给 AI
    const nextResult = await chat.sendMessage(toolExecutionResults)
    response = nextResult.response
  }

  // 4. 返回最终的文本分析结果
  return response.text()
}
```

### 第三步：后端 - 暴露 API (IPC Handler)

将新创建的 AI 分析服务通过 IPC 暴露给前端。

**修改文件**: `src/main/features/handlers/ai/index.ts` (如果不存在则创建)
**修改文件**: `src/main/features/handlers/ipcHandlers.ts`

```typescript
// src/main/features/handlers/ai/index.ts
import { IpcContext } from '@handlers/ipcHandlers'
import * as AIStockAnalysisService from '@services/ai/AIStockAnalysisService'

export const aiHandlers = {
  analyzeMarket: async (_: IpcContext, prompt: string) => {
    return AIStockAnalysisService.analyzeMarket(prompt)
  }
}

// src/main/features/handlers/ipcHandlers.ts
// ... imports
import { aiHandlers } from './ai'

export const ipcHandlers = {
  ...otherHandlers,
  ...aiHandlers // 注册 AI handlers
}
```

### 第四步：前端 - 创建视图组件

创建一个 Vue 组件，提供用户交互界面。

**创建新文件**: `src/renderer/src/views/AIStockAnalysis/index.vue`

```vue
<template>
  <div class="ai-stock-analysis-view">
    <h1>AI 智能股票分析</h1>
    <a-textarea
      v-model:value="prompt"
      placeholder="请输入您想分析的内容，例如：分析一下苹果公司最近一个月的股价表现，并计算5日和10日均线。"
      :rows="4"
    />
    <a-button @click="startAnalysis" :loading="isLoading" style="margin-top: 16px;">
      开始分析
    </a-button>
    <div v-if="analysisResult" class="result-panel">
      <h2>分析报告</h2>
      <div v-html="formattedResult"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { analyzeMarket } from '@api/ai' // 下一步创建
import MarkdownIt from 'markdown-it'

const prompt = ref('')
const isLoading = ref(false)
const analysisResult = ref('')
const md = new MarkdownIt()

const formattedResult = computed(() => {
  return md.render(analysisResult.value)
})

const startAnalysis = async () => {
  if (!prompt.value) {
    message.warning('请输入分析指令！')
    return
  }
  isLoading.value = true
  analysisResult.value = ''
  try {
    const result = await analyzeMarket(prompt.value)
    analysisResult.value = result
  } catch (error) {
    console.error(error)
    message.error('分析失败，请查看控制台获取详情。')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.result-panel {
  margin-top: 24px;
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}
</style>
```

### 第五步：前端 - 添加 API 调用

**修改文件**: `src/renderer/src/api/ai.ts`

```typescript
// src/renderer/src/api/ai.ts

/**
 * 请求 AI 进行股票市场分析
 * @param prompt 用户的分析指令
 * @returns AI 生成的分析报告
 */
export function analyzeMarket(prompt: string): Promise<string> {
  return window.api.invoke('analyzeMarket', prompt)
}
```

### 第六步：前端 - 添加路由和菜单

将新页面加入到应用中。

**修改文件**: `src/renderer/src/router/index.ts`

```typescript
// ...
{
  path: '/ai-stock-analysis',
  name: 'AIStockAnalysis',
  component: () => import('@views/AIStockAnalysis/index.vue'),
  meta: { title: 'AI 智能分析', icon: 'RobotOutlined' } // icon 可自定义
},
// ...
```

同时，由于您的项目菜单是后端动态管理的，您可能需要在后端的路由菜单管理模块（可能在 `routes_menu` 服务中）添加此新路由的信息，以便它能显示在侧边栏菜单中。

## 4. 总结

通过以上六个步骤，我们可以构建一个强大且灵活的 AI 股票分析功能。该架构将 AI 的决策能力与本地安全的数据执行相结合，并且具有高度的可扩展性——未来只需要在 `StockService` 中添加更多的“工具函数”，并同步更新 `AIStockAnalysisService` 中的工具定义，即可赋予 AI 更强大的数据分析能力，而无需改动核心流程代码。
