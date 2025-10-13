
# Script Management Feature Design

## 1. 功能概述 (Feature Overview)

本功能旨在提供一个独立的脚本管理模块，允许用户创建、编辑、存储和删除可复用的 Node.js 脚本。这些脚本可以被项目内其他功能（如定时任务）调用执行。

## 2. 技术方案 (Technical Solution)

- **ID生成**: 使用 `nanoid` 库生成唯一的、复杂的字符串作为脚本ID。
- **后端**:
    - 使用 `better-sqlite3` 存储脚本。
    - 开发一个 `ScriptManagementService` 来处理所有CRUD（增删改查）操作和脚本执行逻辑。
    - 脚本执行将使用 Node.js 的 `vm` 模块或 `child_process` 在一个受控的环境中进行，以访问内部NPM包。
- **前端**:
    - 使用 `monaco-editor` 作为在线脚本编辑器。
    - 开发一个 Vue 视图 (`ScriptManagement.vue`) 来管理脚本。
    - 定时任务模块将进行改造，以支持从该模块选择脚本。

## 3. 依赖项 (Dependencies)

- `monaco-editor`
- `monaco-editor-vue3`
- `nanoid` (已存在)

## 4. 数据库设计 (Database Design)

- **表名**: `scripts`
- **表结构**:
    ```sql
    CREATE TABLE scripts (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    ```
- **`scheduled_tasks` 表变更**:
    - 新增一个字段 `script_id` (TEXT, NULLABLE)，用于外键关联 `scripts(id)`。

## 5. API设计 (API Design)

通过 `ipcMain` 暴露以下通道:

- `script:create` (data: CreateScriptDto) => Promise<Script>
- `script:getAll` () => Promise<Script[]>
- `script:getById` (id: string) => Promise<Script>
- `script:update` (id: string, data: UpdateScriptDto) => Promise<Script>
- `script:delete` (id: string) => Promise<void>
- `script:execute` (id: string) => Promise<{ stdout: string, stderr: string }>

## 6. 模块划分 (Module Division)

- **Service**: `src/main/features/services/ScriptManagement/index.ts`
- **Handler**: `src/main/features/handlers/ScriptManagement/index.ts`
- **Types**: `src/shared/types/dtos/ScriptManagement.ts`
- **Schema**: `src/main/features/database/schema/scripts.ts`
- **API**: `src/renderer/src/api/scriptManagement.ts`
- **View**: `src/renderer/src/views/ScriptManagement.vue`
