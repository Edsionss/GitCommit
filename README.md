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
- **任务调度系统**: 内置基于 `node-cron` 的任务调度器，支持定时执行数据分析、股票数据获取等任务。
- **系统日志管理**: 完整的日志记录系统，帮助用户追踪应用运行状态和调试问题。

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
- **任务调度**: [node-cron](https://github.com/node-cron/node-cron)
- **日期处理**: [date-fns](https://date-fns.org/), [dayjs](https://day.js.org/)
- **工具库**: [lodash](https://lodash.com/)
- **ID 生成**: [nanoid](https://github.com/ai/nanoid)
- **右键菜单**: [@imengyu/vue3-context-menu](https://github.com/imengyu/vue3-context-menu)
- **WebSocket**: [ws](https://github.com/websockets/ws)
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

5.  **其他实用脚本**
    - **代码格式化**:
      ```bash
      pnpm format
      ```
    - **类型检查**:
      ```bash
      pnpm typecheck
      ```
    - **构建轻量版**:
      ```bash
      pnpm make-lite
      ```

## 📂 项目结构

项目遵循 `electron-vite` 推荐的标准结构，将主进程、预加载脚本和渲染进程的代码清晰地分离开。

```
.
├── DevelopmentDocument/   # 开发设计文档目录
├── DevelopmentProgress/   # 开发进度文档目录
├── PLAN_MD/              # 项目计划和优化方案文档
├── MakeLite/             # 轻量版构建相关文件
├── release/              # 打包后的应用程序输出目录
├── scripts/              # 包含自定义脚本，如 MakeLite.ts
├── src/
│   ├── main/             # Electron 主进程代码
│   │   ├── features/     # 核心后端功能模块（如 Git、AI、数据库）
│   │   │   ├── database/ # 数据库相关代码
│   │   │   ├── handlers/ # IPC 处理器
│   │   │   └── services/ # 业务逻辑服务层
│   │   ├── index.ts      # 主进程入口文件
│   │   ├── main.ts       # 主进程配置
│   │   └── utils/        # 主进程工具函数
│   ├── preload/          # 预加载脚本，用于主进程和渲染进程的通信
│   │   ├── index.d.ts    # 预加载脚本类型定义
│   │   └── index.ts      # 预加载脚本实现
│   ├── renderer/         # Electron 渲染进程代码 (Vue.js 应用)
│   │   ├── src/
│   │   │   ├── api/      # 前端 API 请求模块
│   │   │   ├── assets/   # 静态资源
│   │   │   ├── components/ # Vue 公共组件
│   │   │   ├── composables/ # Vue 组合式函数
│   │   │   ├── mock/     # 模拟数据
│   │   │   ├── plugins/  # Vue 插件
│   │   │   ├── router/   # 路由配置
│   │   │   ├── stores/   # Pinia 状态管理
│   │   │   ├── types/    # 前端类型定义
│   │   │   ├── utils/    # 前端工具函数
│   │   │   ├── views/    # 页面级组件
│   │   │   ├── App.vue   # 根组件
│   │   │   └── main.ts   # Vue 应用入口文件
│   │   ├── components.d.ts # 组件类型声明
│   │   └── index.html    # HTML 模板
│   └── shared/           # 主进程和渲染进程共享的代码
│       ├── types/        # 共享类型定义
│       │   └── dtos/     # 数据传输对象
│       └── utils/        # 共享工具函数
├── build/                # 应用图标和构建资源
├── electron.vite.config.ts # Electron-Vite 配置文件
├── package.json          # 项目依赖和脚本配置
└── tsconfig.*.json       # TypeScript 配置文件
```

## 📚 开发规范与文档

本项目遵循严格的开发规范，确保代码质量和一致性：

### 开发流程

1. **文档先行**: 在编写任何代码之前，必须先完成开发设计文档和进度文档的创建。
   - 开发设计文档位于 `DevelopmentDocument/` 目录
   - 开发进度文档位于 `DevelopmentProgress/` 目录

2. **标准化开发流程**: 项目遵循标准化的功能开发工作流，包括：
   - 需求分析与UI设计
   - 数据库模式设计与实现
   - 后端实现（Service层和Handler层）
   - 前后端集成
   - 前端实现与收尾

3. **代码规范**:
   - 使用项目定义的路径别名（如 `@/`, `@features/`, `@sharedType/` 等）
   - 严格遵循项目的目录结构和命名规范
   - 使用 `pnpm` 作为唯一的包管理器

### 详细规范

完整的开发规范请参考 `DevelopmentSpecification.md` 文件，其中包含了详细的开发流程、代码规范和最佳实践。

### 项目计划

项目的优化计划和功能扩展方案位于 `PLAN_MD/` 目录，包括：
- 性能优化计划
- AI功能增强计划
- 前后端分离方案
- 主题系统改进等

## 🤝 贡献指南

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和开源社区。
