
# 定时任务 (Scheduler) 开发进度

- [x] Phase 0: 创建开发设计和进度文档
- [ ] Phase 1.1: 需求分析与UI设计
- [ ] Phase 1.2: 数据库模式设计与实现
  - [ ] 在 `src/main/features/database/schema/` 下创建 `scheduled_tasks.ts`
  - [ ] 在 `src/main/features/database/schema.ts` 中注册新的 schema
- [ ] Phase 2.1: 在 `src/shared/types/dtos/` 下创建 `Scheduler.ts` 类型定义
- [ ] Phase 2.2: 开发 Service 层 (`src/main/features/services/scheduler/index.ts`)
- [ ] Phase 2.3: 开发 Handler 层 (`src/main/features/handlers/scheduler/index.ts`)
- [ ] Phase 3.1: 在 `ipcHandlers.ts` 中注册 IPC 处理器
- [ ] Phase 3.2: 配置 Preload 脚本 (`index.ts` 和 `index.d.ts`)
- [ ] Phase 4.1: 封装前端 API (`src/renderer/src/api/scheduler.ts`)
- [ ] Phase 4.2: 开发 UI 页面与组件 (`Scheduler.vue`, `TaskForm.vue`)
- [ ] Phase 4.3: 在 `MenuManagement.ts` 中配置路由
- [ ] Phase 4.4: 功能验证
