# Electron 项目结构分析与重构计划

本文档旨在分析当前 Electron 项目的结构，识别其优点与潜在问题，并提供一个详细的、分阶段的重构计划，以期达到更清晰、可维护和可扩展的架构。

---

### 第一部分：当前项目结构、作用及问题分析

这是一个基于 `Electron` + `Vite` + `Vue` + `TypeScript` 的现代化桌面应用项目。整体来看，项目结构已经具备了不错的基础，特别是 `Main` 和 `Renderer` 进程代码的分离。但仍然有一些可以优化的地方，使其层次更清晰，职责更单一。

#### 1. 总体结构分析

| 路径 (Path)                    | 类型 (Type) | 作用 (Purpose)                                                                                     |
| :----------------------------- | :---------- | :------------------------------------------------------------------------------------------------- |
| **根目录**                     |             |                                                                                                    |
| `.editorconfig`                | File        | 配置文件，用于在不同编辑器和IDE中保持一致的编码风格。                                              |
| `.gitignore`                   | File        | Git 忽略文件配置，防止 `node_modules`、构建产物等文件被提交。                                      |
| `.npmrc`                       | File        | `npm` 或 `pnpm` 的配置文件，可能用于设置私有 registry 等。                                         |
| `.prettier*`                   | Files       | `Prettier` 代码格式化工具的配置文件和忽略文件。                                                    |
| `electron-builder.yml`         | File        | `electron-builder` 的配置文件，用于定义如何打包和构建应用。                                        |
| `electron.vite.config.ts`      | File        | `electron-vite` 的核心配置文件，定义了 Main, Preload, Renderer 进程的构建策略。                    |
| `package.json`                 | File        | 项目的清单文件，包含依赖、脚本等。                                                                 |
| `pnpm-lock.yaml`               | File        | `pnpm` 的依赖锁定文件，确保团队成员安装完全一致的依赖。                                            |
| `pnpm-workspace.yaml`          | File        | `pnpm` 的工作区配置文件，用于管理 monorepo。                                                       |
| `tsconfig.*.json`              | Files       | TypeScript 配置文件，分别用于整个项目、Node 环境 (Main) 和 Web 环境 (Renderer)。                   |
| **`src` 目录**                 |             | **核心源代码**                                                                                     |
| `src/main`                     | Directory   | **主进程 (Main Process) 代码**。负责创建窗口、管理应用生命周期和所有 Node.js 后端能力。            |
| `src/main/index.ts`            | File        | 主进程入口文件。                                                                                   |
| `src/main/modules`             | Directory   | 主进程的核心业务模块。                                                                             |
| `src/main/modules/ai`          | Directory   | AI 相关功能模块，**这里的 `ai-handlers.ts` 和 `ai-service.ts` 分离得很好，是项目中的一个亮点**。   |
| `src/main/modules/git`         | Directory   | Git 相关的功能模块，同样做了进一步的细分。                                                         |
| `src/main/modules/*.ts`        | Files       | 其他主进程模块，如 `excel.ts`, `fileSystem.ts`, `git.ts`, `ipcHandlers.ts`。                       |
| `src/preload`                  | Directory   | **预加载脚本 (Preload Script)**。作为 Main 和 Renderer 进程之间的桥梁，安全地暴露 API 给渲染进程。 |
| `src/preload/index.ts`         | File        | 预加载脚本入口，通常在这里通过 `contextBridge` 暴露 API。                                          |
| `src/preload/index.d.ts`       | File        | 为暴露到 `window` 对象的 API 提供 TypeScript 类型定义，供渲染进程使用，这是非常好的实践。          |
| `src/renderer`                 | Directory   | **渲染进程 (Renderer Process) 代码**。所有 UI 和前端逻辑都在这里，基于 Vue.js。                    |
| `src/renderer/src/App.vue`     | File        | Vue 应用的根组件。                                                                                 |
| `src/renderer/src/main.ts`     | File        | Vue 应用的入口文件。                                                                               |
| `src/renderer/src/components`  | Directory   | 存放可复用的 Vue 组件，按功能（`AiChat`, `Dashboard` 等）组织，结构清晰。                          |
| `src/renderer/src/composables` | Directory   | 存放 Vue 3 的 Composition API (组合式函数)，用于封装和复用有状态逻辑。                             |
| `src/renderer/src/router`      | Directory   | `vue-router` 的配置。                                                                              |
| `src/renderer/src/stores`      | Directory   | `Pinia` 或 `Vuex` 的状态管理模块，用于管理全局状态。                                               |
| `src/renderer/src/views`       | Directory   | 页面级组件，通常与路由对应。                                                                       |
| `src/services`                 | Directory   | **（问题点）** 存放服务的目录，但其位置很模糊，不清楚是用于 Main 还是 Renderer，或是共享。         |
| `src/services/GitService.ts`   | File        | Git 服务。                                                                                         |
| `src/services/StatsService.ts` | File        | 统计服务。                                                                                         |

#### 2. 存在的主要问题

1.  **`src/services` 目录位置模糊**：

    - **问题**：这是最主要的结构问题。`src/services` 位于 `src` 的根级别，打破了 `main`/`renderer`/`preload` 的清晰隔离。开发者无法一眼看出这些服务是用于主进程的后端逻辑，还是用于渲染进程的前端逻辑。
    - **影响**：降低了代码的可读性和可维护性。新成员加入项目时会感到困惑。

2.  **主进程模块职责可以更细化**：

    - **问题**：`src/main/modules/ipcHandlers.ts` 文件可能会变得非常庞大。它集中了所有的 IPC 事件监听器，当业务增长时，这个文件会成为一个“上帝模块”，难以维护。
    - **影响**：违反了单一职责原则，修改一个功能的 IPC 可能会影响到其他功能。
    - **对比**：`src/main/modules/ai` 目录下的 `ai-handlers.ts` 和 `ai-service.ts` 的拆分方式非常好，应该作为规范推广到所有模块。`handler` 只负责处理 IPC 通信，`service` 负责实现核心业务逻辑。

3.  **缺乏共享代码的明确位置**：

    - **问题**：在 Electron 应用中，主进程和渲染进程之间经常需要共享一些代码，最常见的就是 **类型定义**（例如 IPC 通信的数据结构 DTOs）。目前没有一个约定的目录来存放这部分共享代码。
    - **影响**：可能会导致类型定义重复，或者将它们放在一个不合适的位置（如 `preload` 或 `renderer`），造成耦合。

4.  **渲染进程 API 调用封装**：
    - **问题**：在组件或 `store` 中，可能散布着大量直接调用 `window.api.*` 的代码。
    - **影响**：这使得 IPC 调用与业务逻辑紧密耦合。如果未来需要修改 IPC 的 API，需要在整个前端代码中搜索和替换。同时，这也使得前端业务逻辑难以进行单元测试（因为依赖了 `window` 对象）。

---

### 第二部分：改进建议与详细重构计划

为了解决上述问题，我建议引入一个更严格、更清晰的分层结构。

#### 1. 推荐的目标架构

```
src/
├── main/
│   ├── services/         # (新增) 存放纯粹的业务逻辑服务 (Node.js)
│   │   ├── gitService.ts
│   │   └── statsService.ts
│   ├── features/         # (重构) 原 modules 目录，按功能组织
│   │   ├── ai/
│   │   │   ├── ai.handler.ts   # 负责该功能的 IPC 监听
│   │   │   └── ai.service.ts   # 负责该功能的业务逻辑
│   │   ├── git/
│   │   │   ├── git.handler.ts
│   │   │   └── git.service.ts
│   │   └── ...
│   └── index.ts          # 主进程入口，负责组装和启动
│
├── preload/
│   ├── index.ts
│   └── index.d.ts
│
├── renderer/
│   └── src/
│       ├── api/            # (新增) 封装所有对 Preload API 的调用
│       │   ├── git.ts
│       │   └── stats.ts
│       ├── components/
│       ├── stores/
│       ├── views/
│       └── ...
│
└── shared/                 # (新增) 存放 Main 和 Renderer 共享的代码
    └── types/
        ├── ipc.ts          # 定义所有 IPC 通道名称
        └── dtos/           # 定义数据传输对象 (DTOs)
            ├── git.dto.ts
            └── stats.dto.ts
```

#### 2. 详细分步重构计划表

这个计划表将引导你安全、平稳地完成重构，每一步都是一个小的、可验证的提交。

| 阶段                 | 步骤 | 任务                             | 目标与操作                                                                                                                                                                                                | 验证方式                                                                                                                                                   |
| :------------------- | :--- | :------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P0: 准备**         | 1    | **代码冻结与备份**               | 在开始重构前，确保没有其他功能正在开发。创建一个新的 Git 分支，如 `refactor/architecture`。                                                                                                               | `git checkout -b refactor/architecture`                                                                                                                    |
|                      | 2    | **确保项目可运行**               | 运行 `pnpm install` 和 `pnpm dev`，确保当前项目可以正常编译和运行。                                                                                                                                       | 应用能正常启动并使用。                                                                                                                                     |
| **P1: 建立新结构**   | 3    | **创建新目录**                   | 根据“推荐的目标架构”图，创建 `src/shared/types/dtos`, `src/main/services`, `src/renderer/src/api` 等新目录。                                                                                              | 目录结构在文件浏览器中可见。                                                                                                                               |
| **P2: 共享层重构**   | 4    | **迁移共享类型**                 | 识别在 Main 和 Renderer 之间通信所用的数据结构。在 `src/shared/types/dtos/` 下为它们创建类型定义文件（如 `git.dto.ts`）。                                                                                 | 在 `tsconfig.json` 中配置路径别名 `@shared` 指向 `src/shared`，方便导入。                                                                                  |
|                      | 5    | **更新代码引用**                 | 在主进程和渲染进程中，将原来对这些类型的引用，改为从 `@shared/types/...` 导入。                                                                                                                           | 运行 `pnpm dev`，检查 TypeScript 是否有编译错误。                                                                                                          |
| **P3: 主进程重构**   | 6    | **迁移 Services**                | 将 `src/services` 目录下的所有文件移动到 `src/main/services`。                                                                                                                                            | `git mv src/services/* src/main/services/`                                                                                                                 |
|                      | 7    | **更新 Service 引用**            | 查找所有对旧 `services` 的导入，并将其路径更新为 `src/main/services`。                                                                                                                                    | 全局搜索 `from '@/services'` 或类似路径，并替换。                                                                                                          |
|                      | 8    | **重构 `modules` 为 `features`** | 将 `src/main/modules` 重命名为 `src/main/features`。                                                                                                                                                      | `git mv src/main/modules src/main/features`                                                                                                                |
|                      | 9    | **应用 Handler/Service 模式**    | - **对于 `ipcHandlers.ts`**：将其中的逻辑按功能拆分到各个 `features` 目录下的 `*.handler.ts` 文件中。<br>- **对于 `git.ts` 等**：将其中的业务逻辑剥离到 `*.service.ts`，IPC 相关部分放入 `*.handler.ts`。 | - 每个 `feature` 目录都包含 `handler` 和 `service`。<br>- `main/index.ts` 中现在导入并注册所有 `*.handler.ts`。                                            |
| **P4: 渲染进程重构** | 10   | **创建 API 封装层**              | 在 `src/renderer/src/api` 目录下，为每一类后端功能创建封装文件（如 `git.ts`）。                                                                                                                           | `// src/renderer/src/api/git.ts` <br>`export const getBranches = () => window.api.getBranches();`                                                          |
|                      | 11   | **重构前端调用**                 | 在所有 Vue 组件 (`.vue`) 和 Pinia stores (`.ts`) 中，将直接调用 `window.api.*` 的代码，替换为调用新创建的 `api` 模块。                                                                                    | - **之前**: `const branches = await window.api.getBranches()`<br>- **之后**: `import { gitApi } from '@/api'; const branches = await gitApi.getBranches()` |
|                      | 12   | **验证前端功能**                 | 彻底测试 UI 的所有功能，确保数据请求和展示正常。                                                                                                                                                          | 点击所有按钮，查看所有页面，确保与重构前行为一致。                                                                                                         |
| **P5: 清理与收尾**   | 13   | **删除旧目录和文件**             | 删除空的 `src/services` 目录和 `src/main/features/ipcHandlers.ts` 等已被拆分的文件。                                                                                                                      | 项目结构干净，符合目标架构。                                                                                                                               |
|                      | 14   | **代码审查与格式化**             | 运行 `prettier --write .` 和 `eslint --fix .` (如果配置了) 来统一代码风格。                                                                                                                               | 代码风格一致，没有 linting 错误。                                                                                                                          |
|                      | 15   | **最终测试**                     | 再次完整地运行和测试整个应用，包括打包构建 (`pnpm build`)。                                                                                                                                               | 开发模式和生产构建的应用都能正常工作。                                                                                                                     |
|                      | 16   | **合并代码**                     | 将 `refactor/architecture` 分支合并回主开发分支。                                                                                                                                                         | `git checkout main && git merge refactor/architecture`                                                                                                     |
