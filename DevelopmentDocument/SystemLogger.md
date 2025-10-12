# 系统日志功能开发设计文档

## 功能概述
开发一个系统日志功能，用于记录所有后台打印的日志。该功能将创建一个名为 `sysLogger` 的自定义日志对象，提供与 console 相同的方法（log、warn、error等），同时保留控制台输出并将日志存入数据库。

## 技术方案
1. 创建一个 `sysLogger` 类，实现与 console 相同的方法接口
2. 设计系统日志数据表，存储日志内容、时间戳和状态
3. 实现日志服务层，负责数据库操作
4. 实现日志处理器层，提供 IPC 通信接口
5. 在主进程中替换所有 console 调用为 sysLogger 调用

## 依赖项
不需要额外的 NPM 包，使用项目现有的数据库和 IPC 通信机制

## 数据库设计
创建 `system_logs` 表，包含以下字段：
- id: 主键，自动增长
- content: 日志内容
- timestamp: 日志时间戳
- level: 日志级别（'log', 'warn', 'error'）

## API设计
定义以下 IPC 通道：
- `systemLog:add`: 添加系统日志
- `systemLog:get`: 分页获取系统日志
- `systemLog:delete`: 删除系统日志
- `systemLog:clear`: 清除所有系统日志

## 模块划分
1. **数据库 Schema**: `/src/main/features/database/schema/system_logs.ts`
2. **类型定义**: `/src/shared/types/dtos/systemLog.ts`
3. **服务层**: `/src/main/features/services/systemLog/index.ts`
4. **处理器层**: `/src/main/features/handlers/systemLog/index.ts`
5. **日志工具**: `/src/main/utils/sysLogger.ts`