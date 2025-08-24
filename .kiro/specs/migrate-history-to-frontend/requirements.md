<!--
 * @Author: Edsionss bigsea1017@gmail.com
 * @Date: 2025-08-24 16:23:06
 * @LastEditors: Edsionss bigsea1017@gmail.com
 * @LastEditTime: 2025-08-24 16:23:32
 * @FilePath: \GitCommit\.kiro\specs\migrate-history-to-frontend\requirements.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->

# 将 History 功能从后端迁移到前端 Store 需求文档

## 介绍

当前项目的 history 功能（仓库访问历史记录）是在后端实现的，通过 Electron 主进程管理文件存储。为了提高性能、减少 IPC 通信开销，并与现有的 scanStore 保持一致的架构模式，需要将 history 功能迁移到前端的 stores 中，使用 localStorage 进行数据持久化。

## 需求

### 需求 1：创建前端 History Store

**用户故事：** 作为开发者，我希望在前端 scanStore 中管理仓库访问历史，以便减少后端依赖并提高响应速度

#### 验收标准

1. WHEN 用户访问仓库路径 THEN 系统应将路径添加到前端 localStorage 中的历史记录
2. WHEN 用户重复访问同一仓库 THEN 系统应更新该仓库的最后访问时间并移到列表顶部
3. WHEN 历史记录超过最大数量限制 THEN 系统应自动删除最旧的记录
4. WHEN 用户查看历史记录 THEN 系统应按最后访问时间降序排列显示

### 需求 2：保持 API 接口兼容性

**用户故事：** 作为前端开发者，我希望 history API 接口保持不变，以便现有代码无需修改

#### 验收标准

1. WHEN 调用 historyApi.getHistory() THEN 系统应从前端 store 返回历史记录数据
2. WHEN 调用 historyApi.addHistory(path) THEN 系统应在前端 store 中添加记录
3. WHEN 调用 historyApi.removeHistory(path) THEN 系统应从前端 store 中删除指定记录
4. WHEN 调用 historyApi.clearHistory() THEN 系统应清空前端 store 中的所有历史记录

### 需求 3：数据迁移和兼容性

**用户故事：** 作为用户，我希望现有的历史记录能够平滑迁移到新的存储方式，不丢失数据

#### 验收标准

1. WHEN 系统首次启动新版本 THEN 系统应自动从后端文件迁移历史记录到前端 localStorage
2. WHEN 迁移完成后 THEN 系统应删除后端的历史记录文件和相关代码
3. WHEN 迁移过程中出现错误 THEN 系统应提供降级方案，确保功能正常

### 需求 4：与 scanStore 架构保持一致

**用户故事：** 作为开发者，我希望 history 功能与现有的 scanStore 使用相同的架构模式，便于维护

#### 验收标准

1. WHEN 实现 history store THEN 系统应使用与 scanStore 相同的 localStorage 持久化模式
2. WHEN 定义 store 方法 THEN 系统应遵循 scanStore 的命名约定和结构模式
3. WHEN 处理数据更新 THEN 系统应使用响应式的 ref 和 computed 属性
4. WHEN 保存数据 THEN 系统应实现类似 \_savaScanRecord 的私有保存方法

### 需求 5：移除后端 History 相关代码

**用户故事：** 作为开发者，我希望清理不再需要的后端代码，保持代码库整洁

#### 验收标准

1. WHEN 前端实现完成 THEN 系统应删除 src/main/features/services/history/history.ts
2. WHEN 清理处理器 THEN 系统应删除 src/main/features/handlers/history/history.ts
3. WHEN 更新注册器 THEN 系统应从 ipcHandlers.ts 中移除 history 相关注册
4. WHEN 清理 preload THEN 系统应从 preload 中移除 history 相关的 IPC 暴露

### 需求 6：性能优化

**用户故事：** 作为用户，我希望历史记录操作响应更快，不依赖 IPC 通信

#### 验收标准

1. WHEN 访问历史记录 THEN 响应时间应比原来的 IPC 调用快至少 50%
2. WHEN 添加历史记录 THEN 操作应是同步的，无需等待后端响应
3. WHEN 大量历史记录操作 THEN 系统应保持 UI 响应性，不阻塞界面
4. WHEN 数据持久化 THEN 系统应使用防抖机制避免频繁写入 localStorage
