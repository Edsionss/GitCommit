#### **角色设定**

你是一名精通 Electron 和 Vue 3 的资深前端开发工程师。你擅长使用 TypeScript、Pinia 进行状态管理，并使用 ECharts 进行数据可视化。你的任务是为我的 `GitCommit` 项目创建一个功能完善的股票分析页面。

---

#### **前提条件与技术上下文**

0.**当前只开发前端，文档中提到的后端都跳过**

1.  **项目技术栈**:

    - 前端框架: Vue 3 (使用 `<script setup>` 语法)
    - 语言: TypeScript
    - 状态管理: Pinia
    - UI 组件库:ant design vue
    - 图表库: v-chat
    - 样式: SCSS

2.  **文件结构**:

    - 视图组件应创建在 `src/renderer/src/views/Stock.vue`。
    - 子组件可以创建在 `src/renderer/src/components/stock/` 目录下 (例如 `Watchlist.vue`, `StockChart.vue`)。
    - Pinia Store 文件应创建在 `src/renderer/src/stores/stock.ts`。

---

#### **任务要求**

请根据以上上下文，完成以下四个部分的开发任务：

**任务 1: 创建 Pinia Store (`stores/stock.ts`)**

1.  **State**:

    - `watchlist`: 一个 `Map<string, StockData>` 结构，`key` 为股票代码，`value` 为该股票的详细数据对象。
    - `activeStockCode`: 当前在右侧区域展示的股票代码，类型为 `string | null`。

2.  **StockData 类型定义**:

    ```typescript
    interface StockData {
      code: string
      name: string
      kline: any[] // K线数据 ( v-chat 格式)
      indicators: Record<string, any> // 技术指标
      news: string[] // 资讯列表
      lastUpdateTime: string // ISO 格式时间戳
      analysisHistory: { prompt: string; report: string; time: date }[] // AI分析历史
    }
    ```

3.  **Actions**:
    - `addStock(stockName: string)`:
      - 调用 后台接口 获取股票代码和基本信息。
      - 如果股票已在 `watchlist` 中，则提示用户，否则将其添加到 `watchlist`。
      - **数据持久化**: 使用 `localStorage` 将 `watchlist` 的代码和名称列表持久化。
    - `removeStock(stockCode: string)`: 从 `watchlist` 中删除指定股票，并更新持久化数据。
    - `setActiveStock(stockCode: string)`: 设置 `activeStockCode`。
    - `fetchLatestData(stockCode: string)`:
      - 这是一个异步 Action，用于更新指定股票的最新信息。
      - 依次调用 `stock:fetch-data` 和 `stock:calculate-indicators`。
      - 将获取到的 `kline` 和 `indicators` 更新到 `watchlist` 中对应股票的 state。
      - 更新 `lastUpdateTime`。
    - `runAIAnalysis(stockCode: string)`: (这个 Action 可以先留空，具体逻辑放在组件中处理，因为它是多步骤的)

**任务 2: 创建主视图组件 (`views/Stock.vue`)**

1.  **整体布局**:

    - 页面顶部是一个 `Toolbar`。包含一个 "添加自选" 按钮，点击后弹出 让用户输入股票名称或代码。
    - 主体部分是一个左右分栏布局。

2.  **左侧面板 (25% 宽度)**:

    - 渲染一个子组件 `Watchlist.vue`。

3.  **右侧面板 (75% 宽度)**:
    - 如果 `activeStockCode` 为空，显示一个提示信息，如 "请从左侧选择一支股票查看详情"。
    - 如果 `activeStockCode` 不为空，则渲染一个子组件 `StockDetail.vue`，并将当前选中的股票数据传递给它。

**任务 3: 创建左侧自选列表组件 (`components/stock/Watchlist.vue`)**

1.  **数据**: 从 `stockStore` 中获取 `watchlist` 和 `activeStockCode`。
2.  **显示**:
    - 组件，显示股票名称 (`name`) 和代码 (`code`)的。
    - 当用户点击某一行时，调用 store 的 `setActiveStock` action，并给当前选中行添加高亮样式。
3.  **右键菜单**:
    - 为列表的每一行绑定一个 `contextmenu` 事件。
    - 包含以下三个选项：
      - **删除自选**: 点击后调用 `stockStore.removeStock`。
      - **更新数据**: 点击后调用 `stockStore.fetchLatestData`。
      - **AI 智能分析**: 点击后，触发一个事件通知父组件 `Stock.vue` 开始执行多步骤的 AI 分析流程。

**任务 4: 创建右侧详情面板组件 (`components/stock/StockDetail.vue`)**

1.  **Props**: 接收一个 `stockData` 对象作为 prop。
2.  **布局**: 使用tabs组件分隔内容。
3.  **Tab 1: "K线图"**:
    - 包含一个用于渲染 Charts 的 `div` 容器。
    - 使用 `watchEffect` 监听 `stockData` prop 的变化。
    - 当 `stockData` 或其内部的 `kline` 数据变化时，初始化或更新 Charts 实例，渲染包含 K 线、成交量和均线（MA5, MA10, MA20）的图表。
    - 最上方是k线图，然后技术指标一次在下方一一对应
4.  **Tab 2: "相关资讯"**:
    - 遍历并显示 `stockData.news` 列表。
5.  **Tab 3: "AI 智能分析"**:
    - 该面板用于展示和进行 AI 分析。
    - 上方显示分析结果的区域。
    - 下方是一个聊天输入框和发送按钮，用于与 AI 进行问答。
    - **核心逻辑**: 当用户从左侧菜单点击 "AI 智能分析" 时，`Stock.vue` 父组件会捕获该事件，

---

#### **代码风格和最佳实践**

- 所有代码必须使用 TypeScript，并有良好的类型定义。
- 组件逻辑请使用 Vue 3 Composition API (`<script setup>`)。
- 合理拆分组件，保持组件职责单一。
- 在进行异步操作（如调用 IPC 接口）时，必须有清晰的 `loading` 状态管理和错误处理逻辑。

请严格按照以上要求生成代码。
