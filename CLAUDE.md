# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📋 常用开发命令

### 安装与运行
```bash
# 安装依赖（必须使用 pnpm）
pnpm install

# 启动开发环境（热重载）
pnpm dev

# 以应用模式启动
pnpm dev:app

# 以服务器模式启动
pnpm dev:server

# 预览构建结果
pnpm start
```

### 构建与打包
```bash
# 类型检查
pnpm typecheck
pnpm typecheck:node  # 仅 Node 类型检查
pnpm typecheck:web   # 仅 Vue 类型检查

# 构建（包含类型检查）
pnpm build

# 构建轻量版
pnpm make-lite
pnpm make-lite:dry-run  # 预览模式

# 打包为可执行文件
pnpm package:win   # Windows
pnpm package:mac   # macOS
pnpm package:linux # Linux

# 构建为目录（不打包）
pnpm build:unpack
```

### 代码质量
```bash
# 代码格式化
pnpm format
```

## 🏗️ 代码架构

### 核心架构特点
- **分层架构**: 严格的三层架构 - 主进程 (main)、预加载 (preload)、渲染进程 (renderer)
- **统一 IPC 通信**: 所有前后端交互通过 `src/main/features/handlers/ipcHandlers.ts` 统一分发
- **动态路由系统**: 路由和菜单通过数据库配置，由前端动态生成，非硬编码
- **Service-Handler 模式**: 后端业务逻辑分层（Service 层处理业务，Handler 层处理 IPC 通信）

### 目录结构
```
src/
├── main/                    # Electron 主进程
│   ├── features/            # 核心功能模块
│   │   ├── database/        # 数据库操作（SQLite + better-sqlite3）
│   │   ├── handlers/        # IPC 处理器（每个功能一个文件夹）
│   │   └── services/        # 业务逻辑服务层（每个功能一个文件夹）
│   ├── index.ts             # 主进程入口
│   └── utils/               # 主进程工具
├── preload/                 # 预加载脚本
│   └── index.ts             # IPC 方法绑定到 Window
├── renderer/                # Vue 3 前端应用
│   └── src/
│       ├── api/             # 前端 API 封装
│       ├── components/      # 公共组件（按功能分组）
│       ├── stores/          # Pinia 状态管理
│       ├── views/           # 页面级组件
│       ├── router/          # 动态路由配置
│       └── types/           # 前端类型定义
└── shared/                  # 前后端共享
    ├── types/dtos/          # 数据传输对象（使用 @sharedType 别名）
    └── utils/               # 共享工具函数
```

### 关键配置与别名
```typescript
// 主进程和预加载进程别名
@main, @features, @handlers, @services, @shared, @sharedType, @nodeUtils

// 渲染进程别名（Vue）
@, @views, @components, @api, @stores, @utils
```

## 🎯 开发工作流（14步流程）

⚠️ **重要**: 严格遵循开发规范流程，不得跳过任何步骤。

1. **定义需求**: 确定功能、API、数据来源和 UI 设计
2. **设计 UI**: 使用 Ant Design Vue，设计布局和交互
3. **实现 UI**: 在 `src/renderer/src/views/` 创建页面，`src/renderer/src/components/` 创建组件
4. **设计和开发数据库**: 在 `src/main/features/database/schema/` 创建表结构
5. **编写类型文件**: 在 `src/shared/types/dtos/` 定义 TypeScript 类型
6. **设计后台功能逻辑**: 确定前后端交互方式
7. **开发 service 层**: 在 `src/main/features/services/` 开发业务逻辑
8. **开发 handler 层**: 在 `src/main/features/handlers/` 开发 IPC 注册
9. **注册 IPC 方法**: 在 `src/main/features/handlers/ipcHandlers.ts` 导入并注册
10. **配置 preload**: 在 `src/preload/` 绑定 IPC 方法并填写类型
11. **封装前端 API**: 在 `src/renderer/src/api` 创建 API 封装
12. **前端调用 API**: 完成前后端交互
13. **添加路由**: 在 `src/shared/types/dtos/MenuManagement.ts` 的 `mockFlatRoutes` 中注册
14. **测试**: 确保功能正常运行

### 开发文档要求
- 开发前必须先编写文档到 `DevelopmentDocument/` 目录
- 实时维护进度文档到 `DevelopmentProgress/` 目录
- 文档需使用 Markdown 格式，包含功能描述、接口文档、数据库设计等

## 🔑 核心功能模块

### 主要 Handler（IPC 处理器）
- `ai/ai.ts`: AI 助手（支持 Gemini 和 OpenAI）
- `git/`: Git 仓库分析（scan、info、utils）
- `stock/`: 股票数据（实时数据、技术指标）
- `chat/`: 聊天功能
- `puppeteer/`: 网页抓取
- `websocket/`: WebSocket 通信
- `scheduler/`: 任务调度（node-cron）
- `application/`: 应用管理
- `fileSystem/`: 文件系统操作
- `settings/`: 设置管理

### 主要 Service（业务逻辑）
- `ai/`: AI 相关服务
- `stock/`: 股票数据服务（Yahoo Finance）
- `git/`: Git 操作服务
- `chat/`: 聊天服务
- `scheduler/`: 定时任务服务

### Pinia 状态管理
- `appStore.ts`: 应用全局状态
- `chatStore.ts`: 聊天记录管理
- `scanStore.ts`: Git 扫描数据
- `stock.ts`: 股票数据缓存
- `routesStore.ts`: 动态路由管理
- `settingsStore.ts`: 应用设置
- `webSocketStore.ts`: WebSocket 连接管理

## 🛠️ 技术栈

- **桌面框架**: Electron + Electron-Vite
- **前端框架**: Vue 3 + TypeScript
- **UI 库**: Ant Design Vue + Tailwind CSS
- **状态管理**: Pinia
- **路由**: Vue Router（动态路由）
- **数据库**: SQLite + better-sqlite3
- **图表**: Chart.js + vue-chartjs + chartjs-chart-financial
- **AI 集成**: Google Gemini + OpenAI
- **股票数据**: Yahoo Finance API + technicalindicators
- **Git 操作**: simple-git
- **任务调度**: node-cron
- **构建**: Vite + Electron-Vite + electron-builder
- **格式化**: Prettier

## 📝 重要开发规范

1. **包管理器**: 必须使用 `pnpm`，禁止使用 npm 或 yarn
2. **路径别名**: 所有导入必须使用项目定义的别名（@sharedType、@features 等）
3. **组件命名**: 使用大驼峰命名法
4. **数据库操作**: 使用 `DatabaseHelper.ts` 封装的方法（`dbHelper`）
5. **日志系统**: 所有表必须添加审计日志触发器（`audit_logs` 表）
6. **IPC 注册**: 所有新功能必须在 `ipcHandlers.ts` 中注册
7. **动态路由**: 路由通过数据库配置，修改 `MenuManagement.ts` 中的 `mockFlatRoutes`
8. **开发文档**: 新功能必须先编写开发文档和进度文档

## 🗄️ 数据库

- **位置**: 项目根目录或用户目录下的 SQLite 文件
- **工具**: `dbHelper` 提供便捷的数据库操作方法
- **日志**: 所有表自动记录审计日志到 `audit_logs` 表
- **Schema**: 定义在 `src/main/features/database/schema/` 目录

## 🔗 通信模式

- **前端 → 后端**: 通过 IPC 调用预加载脚本暴露的方法
- **后端 → 前端**: 通过 WebSocket 或事件推送
- **实时数据**: WebSocket 连接管理（`webSocketStore.ts`）

## 📦 构建产物

- **输出目录**: `release/`
- **临时目录**: `out/`
- **应用图标**: `build/` 目录

---

⚠️ **关键提醒**:
- 严格遵守 14 步开发流程
- 使用 pnpm 管理依赖
- 新功能必须先写文档
- 所有导入使用路径别名
- 不得修改与本次开发无关的文件
