# 项目文档: GitCommit

## 1. 项目概述

`GitCommit` 是一个使用 Electron、Vue.js 和 TypeScript 构建的跨平台桌面应用程序。它提供了一个图形用户界面，用于与 Git 版本控制系统进行交互。用户可以通过该应用浏览提交历史、查看分支、分析贡献者活动以及执行基本的 Git 操作。该项目旨在为开发者提供一个直观、高效的 Git 工作流管理工具。

## 2. 技术栈

本项目采用了一系列现代化的前端和桌面应用开发技术：

*   **核心框架**:
    *   **[Electron](https://www.electronjs.org/)**: 用于构建跨平台桌面应用的框架，通过将 Chromium 和 Node.js 合并到同一个运行时中，实现了使用 Web 技术开发桌面应用。
    *   **[Vue.js 3](https://vuejs.org/)**: 一款用于构建用户界面的渐进式 JavaScript 框架，负责应用的视图层。
    *   **[Vite](https://vitejs.dev/)**: 新一代前端构建工具，为开发环境提供极速的热模块替换（HMR），并为生产环境提供优化的构建输出。

*   **语言**:
    *   **[TypeScript](https://www.typescriptlang.org/)**: JavaScript 的超集，添加了静态类型，增强了代码的可维护性和健壮性。

*   **核心库与插件**:
    *   **[Pinia](https://pinia.vuejs.org/)**: Vue 的官方状态管理库，用于在整个应用程序中提供一个集中式的、类型安全的状态存储。
    *   **[simple-git](https://github.com/steveukx/git-js)**: 一个轻量级的 Node.js 库，用于在应用后端（Electron 主进程）执行 Git 命令。
    *   **[Vue Router 4](https://router.vuejs.org/)**: Vue.js 的官方路由管理器，用于实现单页应用内的页面导航。
    *   **[Ant Design Vue](https://www.antdv.com/)**: 一个基于 Vue 3 和 Ant Design 设计体系的企业级 UI 组件库，提供了丰富的预构建组件，用于快速搭建界面。
    *   **[Vue-ChartJS](https://vue-chartjs.org/)**: 一个封装了 Chart.js 的 Vue 组件库，用于在仪表盘页面生成交互式图表。
    *   **[Electron Toolkit](https://github.com/alex8088/electron-toolkit)**: 一个用于简化 Electron 开发的实用工具集，包括预加载脚本、进程优化等。

*   **构建与打包**:
    *   **[Electron Builder](https://www.electron.build/)**: 用于将 Electron 应用打包成可分发的安装程序（如 Windows 的 `.exe`、macOS 的 `.dmg`、Linux 的 `.AppImage` 等）。
    *   **[PNPM](https://pnpm.io/)**: 高效的包管理器。

## 3. 项目结构

项目遵循 `electron-vite` 推荐的标准结构，将主进程、预加载脚本和渲染器进程的代码清晰地分离开来：

```
/
├── build/              # 图标等构建资源
├── out/                # 构建输出目录
├── src/
│   ├── main/           # Electron 主进程代码 (Node.js 环境)
│   │   └── index.ts    # 主进程入口，负责创建窗口和处理原生事件
│   ├── preload/        # 预加载脚本
│   │   └── index.ts    # 在渲染器进程加载前运行，用于桥接主进程和渲染器
│   └── renderer/       # 渲染器进程代码 (浏览器环境)
│       ├── src/
│       │   ├── assets/         # 静态资源 (CSS, 图片)
│       │   ├── components/     # Vue 公共组件
│       │   ├── composables/    # Vue 组合式函数 (如 useTheme)
│       │   ├── router/         # Vue Router 路由配置
│       │   ├── views/          # 页面级 Vue 组件
│       │   ├── App.vue         # 根 Vue 组件
│       │   └── main.ts         # 渲染器入口，初始化 Vue 应用
│       └── index.html      # 渲染器 HTML 入口文件
├── electron-builder.yml # Electron Builder 配置文件
├── electron.vite.config.ts # Electron-Vite 配置文件
├── package.json        # 项目依赖和脚本
└── tsconfig.json       # TypeScript 配置文件
```

## 4. 核心功能与页面详解

应用程序的主要功能通过左侧的侧边栏进行导航，包含以下几个核心页面：

### 4.1. 主窗口与布局

*   **主布局 (`MainLayout.vue`)**: 定义了应用的基本结构，包括顶部标题栏 (`TheHeader.vue`) 和左侧导航栏 (`TheSidebar.vue`)。
*   **顶部标题栏 (`TheHeader.vue`)**: 显示应用 Logo 和名称，并包含一个 "Select Repository" 按钮，该按钮会调用 Electron 的对话框 API 来让用户选择本地的 Git 仓库目录。
*   **侧边导航栏 (`TheSidebar.vue`)**: 提供到应用内所有主要页面的链接。

### 4.2. 页面 (Views)

*   **Dashboard (`Dashboard.vue`)**:
    *   **功能**: 应用的欢迎页面和信息中心。
    *   **实现**: 使用 Vue-ChartJS 库展示一个 "Commit Activity"（提交活动）的柱状图，为用户提供仓库活动的快速概览。

*   **Commits (`CommitsView.vue`)**:
    *   **功能**: 这是应用的核心页面之一，用于展示和操作 Git 提交。
    *   **组件构成**:
        *   `GitNavigationComponent.vue`: 提供 "Fetch", "Pull", "Push" 等常用 Git 网络操作的按钮。
        *   `GitFilterComponent.vue`: 提供一个输入框，允许用户按提交信息、作者或哈希值过滤提交列表。
        *   `GitResultsComponent.vue`: 显示结果摘要信息（如 "Showing 1-20 of 100 results"）。
        *   `GitLogsComponent.vue`: 使用 Ant Design Vue 的 `a-table` 组件以表格形式展示 Git 提交日志，包含 `Hash`, `Date`, `Message`, `Author` 等列。
    *   **数据**: 目前使用模拟数据，最终会通过 `GitService` 从用户选择的仓库中获取真实数据。

*   **Branches (`BranchesView.vue`)**:
    *   **功能**: 展示仓库中的所有本地和远程分支。
    *   **实现**: 使用 `a-table` 组件显示分支列表，包含分支名称、最后一次提交的哈希值以及是否为当前分支的指示。

*   **Repository (`Repository.vue`)**:
    *   **功能**: 提供对当前仓库状态的概览。
    *   **实现**: 包含一个 "Get Status" 按钮，点击后会调用 `git-status` IPC 通道，获取并显示 `git status` 命令的结果。

*   **Contributors (`Contributors.vue`)**:
    *   **功能**: 分析并展示项目的所有贡献者及其提交次数。
    *   **实现**: 使用 `a-table` 列出贡献者姓名和他们的总提交数。数据可以通过分析 Git 日志来计算。

*   **Settings (`Settings.vue`)**:
    *   **功能**: 提供应用配置选项。
    *   **实现**: 使用 `a-tabs` 组件将设置分为 "Basic" 和 "Advanced" 两个标签页，分别加载 `BasicSettings.vue` 和 `AdvancedSettings.vue` 组件。

## 5. 后端服务与数据通信 (IPC)

Electron 的多进程架构要求前后端（主进程与渲染器进程）之间通过进程间通信（IPC）来传递数据。

### 5.1. 主进程 (`src/main/index.ts`)

主进程是应用的后端，负责所有与 Node.js API 和系统资源交互的任务。

*   **窗口管理**: 创建和管理 `BrowserWindow`。
*   **IPC Handlers**:
    *   注册了一系列 `ipcMain.handle` 监听器，用于响应来自渲染器进程的请求。
    *   使用 `simple-git` 库执行实际的 Git 命令。
    *   支持的 IPC 通道包括:
        *   `git-log`: 获取提交日志。
        *   `git-status`: 获取仓库状态。
        *   `git-diff`: 获取文件差异。
        *   `git-branches`: 获取分支列表。
        *   `git-tags`: 获取标签列表。
        *   `git-remotes`: 获取远程仓库列表。
        *   `git-contributors`: 获取贡献者列表。
        *   `select-folder`: 打开系统对话框以选择文件夹。

### 5.2. 渲染器服务 (`src/services/`)

在渲染器进程中，服务文件封装了对 IPC 通道的调用，使 Vue 组件可以像调用普通 TypeScript 函数一样与主进程通信。

*   **`GitService.ts`**:
    *   导出一系列函数，每个函数对应主进程中的一个 Git 相关 IPC 通道。
    *   例如，`gitLog(repoPath)` 函数会调用 `ipcRenderer.invoke('git-log', repoPath)`。

*   **`StatsService.ts`**:
    *   一个用于处理和分析从 `GitService` 获取的数据的服务。
    *   例如，`calculateCommitFrequency` 函数可以接收日志数据并计算每日提交频率。

## 6. 主题化与样式

*   **CSS 结构**: 项目在 `src/renderer/src/assets/styles/` 目录下组织了多个 CSS 文件，并通过 `main.css` 统一导入。这包括了 CSS 重置 (`reset.css`, `base.css`)、全局变量 (`variables.css`) 和主题 (`theme.css`)。
*   **动态主题**:
    *   `composables/useTheme.ts` 中定义了一个 `useTheme` 组合式函数。
    *   它允许用户在 'light' 和 'dark' 主题之间切换。
    *   主题选择被保存在 `localStorage` 中，并在应用启动时恢复。
    *   主题切换通过在 `<html>` 元素上设置 `data-theme` 属性来实现，`theme.css` 文件中定义了对应的主题样式。