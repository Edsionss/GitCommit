## **标准化功能开发工作流 (Standardized Feature Development Workflow)**

### AI辅助开发规则

- **最高指令严格遵循本文档，严格遵循用户指令**

### 1. 核心原则与约束 (Core Principles & Constraints)

所有开发活动必须严格遵守以下核心原则，以确保项目代码的质量、一致性和可维护性。

- **严格遵循项目规范**: 必须完全遵循项目中已有的架构设计、编码风格、命名约定和目录结构。禁止引入与项目风格不符的模式。
- **严格限定变更范围**: 任何开发任务都必须严格限制在当前功能范围内。禁止修改任何与本次需求无关的文件或代码。所有变更必须是原子性的、与功能直接相关的。
- **别名优先原则**: 在导入模块时，必须优先使用 `tsconfig.node.json` 和 `tsconfig.web.json` 中定义的路径别名（如 `@/`, `@features/`, `@sharedType/` 等）。
- **依赖包管理**:
  - 项目唯一的包管理器是 `pnpm`。
  - 在引入新的NPM包之前，必须进行尽职调查：确认其是否处于活跃维护状态、与项目技术栈（Vue 3, Electron等）兼容，并评估其必要性。
- **文档先行**: 在编写任何代码之前，必须先完成开发设计文档和进度文档的创建。
- **文档先行**: 所有的示例都是让你理解规则，和实际项目没有任何关系，请不要采用，只作为参考。

### 2. 开发前置任务：文档编制 (Pre-Development: Documentation)

文档是保证开发方向正确和过程透明的关键。

1.  **创建开发设计文档 (Development Design Document)**:
    - **位置**: `DevelopmentDocument/`
    - **命名**: `[FeatureName].md` (例如: `ScheduledTasks.md`)
    - **内容**:
      - **功能概述**: 简要描述该功能的目标和解决的问题。
      - **技术方案**: 阐述实现该功能的核心思路和技术选型。
      - **依赖项**: 列出需要安装的新NPM包。
      - **数据库设计**: 描述所需的数据表结构、索引、视图及触发器。
      - **API设计**: 定义前后端交互的IPC通道名称和数据传输对象（DTO）。
      - **模块划分**: 规划涉及的主要文件模块（Service, Handler, Component等）及其职责。

2.  **创建开发进度文档 (Development Progress Document)**:
    - **位置**: `DevelopmentProgress/`
    - **命名**: `[FeatureName].md`
    - **内容**: 以任务清单（Checklist）的形式记录开发流程中的每一步。在开发过程中，实时勾选已完成的步骤，确保进度文档与实际开发进度完全同步。

### 3. Phase 1: 规划与设计 (Planning & Design)

此阶段的目标是为后续编码工作奠定坚实的基础。

- **步骤 1.1: 需求分析与UI设计**:
  - 明确功能的具体需求、数据来源和用户交互流程。
  - 基于需求，使用 **Ant Design Vue** 组件库设计UI界面，并确保所有样式均使用 `App.vue` 中定义的全局CSS变量，以支持主题统一管理。

- **步骤 1.2: 数据库模式设计与实现 (Schema)**:
  1.  **设计表结构**: 设计数据表，并为需要追踪变更的表设计对应的审计日志触发器（`audit_logs` 表结构参考 `src/main/features/database/schema/audit_logs.ts`）；audit_logs表已经存在，无需重复设计。
  2.  **索引视图等**: 按需求适当的设计索引、视图等数据库对象，以优化查询性能和数据检索效率。
  3.  **编写建表语句**: 在 `/src/main/features/database/schema/` 目录下，创建一个以表名命名的 `.ts` 文件（例如 `scheduled_tasks.ts`），并默认导出一个包含SQL `CREATE` 语句的字符串。
  4.  **注册Schema**: 打开 `/src/main/features/database/schema.ts` 文件，导入刚刚创建的schema文件，并将其添加到导出的 `schema` 数组中，以确保应用初始化时能自动建表。

### 4. Phase 2: 后端实现 (Backend Implementation)

此阶段专注于在主进程（Main Process）中实现核心业务逻辑。

- **步骤 2.1: 类型定义 (Type Definition)**:
  - 在 `src/shared/types/dtos/` 目录下，为新功能创建一个类型定义文件（例如 `ScheduledTasks.ts`）。
  - 在此文件中定义所有与数据库交互、API请求/响应相关的数据传输对象（DTO），确保前后端的类型安全。
  - 通过 `@sharedType/` 别名在主进程和渲染进程中引用这些类型。

- **步骤 2.2: 服务层开发 (Service Layer)**:
  - 在 `/src/main/features/services/` 目录下，创建一个以功能命名的子目录（例如 `ScheduledTasks`）。
  - 在该子目录中创建 `index.ts` 文件。
  - 服务层负责封装核心业务逻辑和数据库操作。通过 `import { dbHelper } from '@features/database'` 导入数据库帮助实例，并使用其封装好的方法进行数据交互。

- **步骤 2.3: 处理器层开发 (Handler Layer)**:
  - 在 `/src/main/features/handlers/` 目录下，创建一个以功能命名的子目录（例如 `ScheduledTasks`）。
  - 在该子目录中创建 `index.ts` 文件。
  - 处理器层负责定义IPC通信接口，作为连接渲染进程请求和服务层逻辑的桥梁。它调用Service层的方法来完成具体任务。

### 5. Phase 3: 前后端集成 (Integration)

此阶段的目标是打通主进程与渲染进程之间的通信链路。

- **步骤 3.1: 注册IPC处理器 (IPC Handler Registration)**:
  - 打开 `src/main/features/handlers/ipcHandlers.ts` 文件。
  - 从刚刚创建的Handler文件中导入注册函数，并在 `ipcHandlers` 数组中调用它，以激活IPC监听。

- **步骤 3.2: 预加载脚本配置 (Preload Script)**:
  - 编辑 `src/main/preload/index.ts` 文件。
  - 使用 `contextBridge.exposeInMainWorld` 将后端定义的IPC通道安全地暴露给渲染进程。
  - 同时，更新对应的 `preload.d.ts` 类型声明文件，为 `window` 对象上暴露的API提供TypeScript类型提示。

### 6. Phase 4: 前端实现与收尾 (Frontend Implementation & Finalization)

此阶段完成用户界面的开发和功能的最终整合。

- **步骤 4.1: 前端API封装 (API Abstraction)**:
  - 在 `src/renderer/src/api/` 目录下，创建一个新的API文件。
  - 封装对Preload脚本暴露方法的调用，为UI层提供简洁、语义化的异步函数接口。

- **步骤 4.2: UI页面与组件开发 (UI Development)**:
  1.  **组件开发**: 在 `src/renderer/src/components/` 目录下，为功能所需的可复用组件创建独立的子目录（例如 `ScheduledTaskForm`），并在其中开发 `.vue` 文件。
  2.  **页面开发**: 在 `src/renderer/src/views/` 目录下，创建功能的主页面文件（例如 `ScheduledTasks.vue`）。
  3.  **逻辑集成**: 在Vue组件/页面中，调用已封装好的前端API接口，实现前后端数据交互和业务流程。

- **步骤 4.3: 路由配置 (Routing)**:
  - 打开 `src/shared/types/dtos/MenuManagement.ts` 文件。
  - 在 `mockFlatRoutes` 数组中添加新的路由配置对象。
  - `componentPath` 字段只需填写 `views` 目录下的文件名（不含扩展名），例如 `ScheduledTasks`。

- **步骤 4.4: 功能验证 (Verification)**:
  - 在开发环境中确认功能按预期工作，无明显错误。
  - 确保功能在应用打包后依然能够正确运行。
  - **注意**: AI辅助开发模式下，此步骤由人类开发者负责。AI只需提示功能开发完成即可。
