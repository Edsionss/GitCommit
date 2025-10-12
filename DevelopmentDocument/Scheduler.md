
# 定时任务 (Scheduler) 功能设计文档

## 1. 功能概述 (Feature Overview)

本功能允许用户在应用内创建、管理和执行定时任务。用户可以自定义任务的执行时间和触发的动作，例如发送桌面通知、执行数据抓取脚本等，以实现流程自动化。

## 2. 技术方案 (Technical Solution)

- **核心调度器**: 采用 `node-cron` 库作为后端的任务调度核心。它允许我们使用标准的 Cron 表达式来定义任务的执行周期。
- **数据持久化**: 新建一个 `scheduled_tasks` 表来存储所有任务的配置信息。
- **前后端通信**: 通过 Electron 的 IPC 机制进行通信。前端负责UI交互，后端负责任务的实际调度和执行。
- **UI 框架**: 使用 Ant Design Vue 构建任务列表和配置表单。

## 3. 依赖项 (Dependencies)

- `node-cron`: 用于任务调度的核心库。
- `@types/node-cron`: `node-cron` 的 TypeScript 类型定义。

## 4. 数据库设计 (Database Design)

- **表名**: `scheduled_tasks`
- **表结构**:
  ```sql
  CREATE TABLE scheduled_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      cron_expression TEXT NOT NULL,
      action_type TEXT NOT NULL, -- e.g., 'notification', 'run_script'
      action_payload TEXT, -- JSON string with action details
      is_enabled INTEGER NOT NULL DEFAULT 1, -- 1 for true, 0 for false
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  ```
- **审计日志**: 将为此表创建 `audit_logs` 触发器，以追踪所有变更。

## 5. API 设计 (API Design)

- `scheduler:get-tasks`: 获取所有定时任务列表。
- `scheduler:create-task`: 创建一个新的定时任务。
- `scheduler:update-task`: 更新一个已存在的定时任务。
- `scheduler:delete-task`: 删除一个定时任务。
- `scheduler:toggle-task`: 启用或禁用一个定时任务。

## 6. 模块划分 (Module Breakdown)

- `src/main/features/database/schema/scheduled_tasks.ts`: 数据库建表语句。
- `src/shared/types/dtos/Scheduler.ts`: 前后端共享的类型定义。
- `src/main/features/services/scheduler/index.ts`: 核心业务逻辑（任务的增删改查、启动/停止调度）。
- `src/main/features/handlers/scheduler/index.ts`: IPC 处理器，连接前端请求与后端服务。
- `src/renderer/src/api/scheduler.ts`: 前端 API 封装。
- `src/renderer/src/views/Scheduler.vue`: 定时任务管理页面的主视图。
- `src/renderer/src/components/Scheduler/TaskForm.vue`: 用于创建和编辑任务的表单组件。
