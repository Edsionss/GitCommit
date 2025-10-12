# CognitoOcean <img src="./build/CognitoOcean1.png" alt="App Screenshot" height="80px">

> Charting Your Path to Clarity.

CognitoOcean 是一个使用 Electron、Vue 3 和 TypeScript 构建的现代化桌面应用程序。它提供了一套强大的工具集，用于 Git 仓库分析、AI 辅助洞察、股票市场跟踪和数据可视化，帮助用户从复杂的数据中提取价值。

## ✨ 主要功能

- **Git 仓库深度分析**: 扫描本地 Git 仓库，提供提交历史、代码贡献者、文件变更频率等多种维度的可视化报告。
- **智能 AI 助手**: 集成大型语言模型（支持 Google Gemini 和 OpenAI），提供代码分析、提交信息生成、技术问答等智能服务。
- **强大的数据可视化**: 通过交互式图表（使用 Chart.js）直观展示数据，无论是代码提交趋势还是股票价格波动，都一目了然。
- **股票市场跟踪与分析**: 集成雅虎财经 API，提供实时的股票数据、历史价格图表和常用的技术指标分析（使用 `chartjs-chart-financial` 和 `technicalindicators`）。
- **Web 内容抓取**: 内置 Puppeteer，能够从指定网页抓取和解析所需数据。
- **本地化数据存储**: 使用 SQLite 和 `electron-store` 在本地安全地存储用户的配置、扫描历史和数据，确保隐私和性能。
- **自动更新**: 集成 `electron-updater`，应用能够自动检查并下载更新，始终保持最新状态。
- **现代化 UI**: 基于 Ant Design Vue 构建，提供美观、一致且响应迅速的用户体验。

## 🏛️ 核心架构亮点

- **动态路由与菜单管理**: 应用的导航菜单和路由并非硬编码，而是通过后端进行配置、由前端动态生成。这允许在不修改前端代码的情况下，灵活地调整和扩展应用的功能模块。
- **统一的 IPC 通信层**: 项目在主进程中设计了统一的 IPC (进程间通信) 入口 (`src/main/features/handlers/ipcHandlers.ts`)，所有前端对后端的请求都通过这里分发。这种设计使得前后端功能调用清晰、解耦且易于管理。

## 🛠️ 技术栈

- **核心框架**: [Electron](https://www.electronjs.org/), [Vue 3](https://vuejs.org/)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **构建工具**: [Vite](https://vitejs.dev/), [Electron-Vite](https://electron-vite.org/)
- **UI 框架**: [Ant Design Vue](https://www.antdv.com/)
- **状态管理**: [Pinia](https://pinia.vuejs.org/)
- **路由**: [Vue Router](https://router.vuejs.org/)
- **数据库**: [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- **Git 操作**: [simple-git](https://github.com/steveukx/git-js)
- **AI 集成**: [Google Gemini](https://ai.google.dev/), [OpenAI](https://openai.com/)
- **图表**: [Chart.js](https://www.chartjs.org/), [vue-chartjs](https://vue-chartjs.org/), [chartjs-chart-financial](https://github.com/chartjs/chartjs-chart-financial)
- **股票数据**: [yahoo-finance2](https://github.com/gadicc/node-yahoo-finance2), [technicalindicators](https://github.com/anandanand84/technicalindicators)
- **Web 抓取**: [Puppeteer](https://pptr.dev/)
- **HTTP 请求**: [Axios](https://axios-http.com/)
- **Markdown 渲染**: [Marked](https://marked.js.org/)
- **自动更新**: [electron-updater](https://www.electron.build/auto-update)

## 🚀 开始使用

### 环境要求

- [Node.js](https://nodejs.org/) (v18 或更高版本)
- [pnpm](https://pnpm.io/) (推荐使用)

### 安装与运行

1.  **克隆仓库**

    ```bash
    git clone https://github.com/your-username/cognitoocean.git
    cd cognitoocean
    ```

2.  **安装依赖**

    ```bash
    pnpm install
    ```

3.  **启动开发环境**

    ```bash
    pnpm dev
    ```

    此命令将以热重载模式启动应用程序，方便进行开发和调试。

4.  **打包应用程序**
    我们提供了针对不同操作系统的打包脚本：
    - **Windows**:
      ```bash
      pnpm build:win
      ```
    - **macOS**:
      ```bash
      pnpm build:mac
      ```
    - **Linux**:
      ```bash
      pnpm build:linux
      ```
      打包后的文件将位于项目根目录下的 `release` 文件夹中。

## 📂 项目结构

项目遵循 `electron-vite` 推荐的标准结构，将主进程、预加载脚本和渲染进程的代码清晰地分离开。

```
.
├── release/              # 打包后的应用程序输出目录
├── scripts/              # 包含自定义脚本，如 MakeLite.ts
├── src/
│   ├── main/             # Electron 主进程代码
│   │   ├── features/     # 核心后端功能模块（如 Git、AI、数据库）
│   │   └── index.ts      # 主进程入口文件
│   ├── preload/          # 预加载脚本，用于主进程和渲染进程的通信
│   │   └── index.ts
│   └── renderer/         # Electron 渲染进程代码 (Vue.js 应用)
│       ├── src/
│       │   ├── api/      # 前端 API 请求模块
│       │   ├── assets/   # 静态资源
│       │   ├── components/ # Vue 公共组件
│       │   ├── stores/   # Pinia 状态管理
│       │   ├── views/    # 页面级组件
│       │   ├── router/   # 路由配置
│       │   └── main.ts   # Vue 应用入口文件
│       └── index.html
└── electron.vite.config.ts # Electron-Vite 配置文件
```

## 🤝 贡献

欢迎对 CognitoOcean 做出贡献！如果您有任何想法、建议或发现了 Bug，请随时提交 Issues 或 Pull Requests。

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。
