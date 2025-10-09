# AI类型统一与重构计划

## 任务概述

本项目中发现多个地方定义了AI相关的接口和类型，导致类型定义不一致和重复。本计划旨在统一所有AI相关的类型定义，将它们集中到shared目录中，确保前后端使用相同的类型定义，提高代码的可维护性和类型安全性。

## 问题分析

### 当前问题
1. **类型定义分散**：AI相关的类型定义分散在多个文件中
   - `src/shared/types/dtos/ai.ts`
   - `src/renderer/src/types/setting.ts`
   - `src/main/features/services/ai/ai.ts`（内部接口）
   - `src/preload/index.d.ts`（接口定义）

2. **类型定义不一致**：
   - `AiConfig`接口在`src/shared/types/dtos/ai.ts`和`src/renderer/src/types/setting.ts`中定义略有不同
   - 路径别名`@sharedType/ai`指向不存在的文件
   - 有些文件使用`@shared/types/dtos/ai`，有些使用`@sharedType/ai`

3. **内部接口重复**：
   - `GenerateCommitMessageParams`、`GenerateChatResponseParams`等接口在`src/main/features/services/ai/ai.ts`中定义
   - `ChatMessage`接口在多个文件中重复定义

### 影响范围
- 前端渲染进程（Renderer）
- 后端主进程（Main）
- 预加载脚本（Preload）
- 共享类型定义（Shared）

## 解决方案

### 第一阶段：整理和统一类型定义
1. **创建统一的AI类型定义文件**
   - 在`src/shared/types/ai.ts`中创建统一的AI类型定义
   - 包含所有前后端需要的AI相关类型

2. **更新路径别名配置**
   - 确保`@sharedType/*`正确指向`src/shared/types/*`
   - 更新所有引用，使用统一的路径别名

### 第二阶段：更新引用
1. **更新主进程中的引用**
   - 更新`src/main/features/services/ai/ai.ts`中的类型引用
   - 更新`src/main/features/handlers/ai/ai.ts`中的类型引用

2. **更新预加载脚本中的引用**
   - 更新`src/preload/index.ts`中的类型引用
   - 更新`src/preload/index.d.ts`中的类型引用

3. **更新渲染进程中的引用**
   - 更新`src/renderer/src/api/ai.ts`中的类型引用
   - 更新`src/renderer/src/composables/ai.ts`中的类型引用
   - 更新`src/renderer/src/types/setting.ts`中的类型引用

### 第三阶段：清理冗余定义
1. **删除重复的类型定义**
   - 删除`src/renderer/src/types/setting.ts`中的`AiConfig`定义
   - 删除`src/preload/index.d.ts`中的`ChatMessage`定义

2. **更新AppSettings接口**
   - 修改`src/renderer/src/types/setting.ts`中的`AppSettings`接口，引用共享类型

## 实施计划

### 第一阶段：整理和统一类型定义
- [ ] 创建`src/shared/types/ai.ts`文件，包含所有AI相关类型
- [ ] 更新路径别名配置，确保`@sharedType/*`正确指向`src/shared/types/*`

### 第二阶段：更新引用
- [ ] 更新`src/main/features/services/ai/ai.ts`中的类型引用
- [ ] 更新`src/main/features/handlers/ai/ai.ts`中的类型引用
- [ ] 更新`src/preload/index.ts`中的类型引用
- [ ] 更新`src/preload/index.d.ts`中的类型引用
- [ ] 更新`src/renderer/src/api/ai.ts`中的类型引用
- [ ] 更新`src/renderer/src/composables/ai.ts`中的类型引用
- [ ] 更新`src/renderer/src/types/setting.ts`中的类型引用

### 第三阶段：清理冗余定义
- [ ] 删除`src/renderer/src/types/setting.ts`中的`AiConfig`定义
- [ ] 删除`src/preload/index.d.ts`中的`ChatMessage`定义
- [ ] 更新`src/renderer/src/types/setting.ts`中的`AppSettings`接口

## 预期结果

1. **类型定义统一**：所有AI相关的类型定义将集中在一个文件中
2. **类型安全**：前后端使用相同的类型定义，减少类型不匹配的错误
3. **代码维护性**：类型定义集中管理，便于维护和更新
4. **开发体验**：统一的路径别名和类型定义，提高开发效率

## 风险评估

1. **低风险**：主要是类型定义的整理和统一，不涉及业务逻辑的修改
2. **兼容性**：需要确保所有引用都正确更新，避免编译错误
3. **测试**：需要全面测试AI功能，确保重构后功能正常

## 后续计划

1. **代码审查**：邀请团队成员审查重构后的类型定义
2. **文档更新**：更新相关文档，反映新的类型定义结构
3. **持续优化**：根据使用情况，持续优化类型定义