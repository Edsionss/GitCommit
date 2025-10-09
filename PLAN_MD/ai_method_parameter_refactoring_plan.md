# AI方法参数重构计划

## 概述
将现有的AI方法的传参方式从顺序传参改成对象传参，并更新所有使用到的地方。

## 需要修改的文件和方法

### 1. 主要AI服务文件
**文件**: `src/main/features/services/ai/ai.ts`

#### 需要修改的方法:
1. `generateCommitMessage(_, prompt, aiConfig, isStream)`
   - 修改为: `generateCommitMessage({ _, prompt, aiConfig, isStream })`

2. `generateChatResponse(_, prompt, aiConfig, history, isStream)`
   - 修改为: `generateChatResponse({ _, prompt, aiConfig, history, isStream })`

3. `callOpenAI(_, prompt, apiKey, model, history, isStream)`
   - 修改为: `callOpenAI({ _, prompt, apiKey, model, history, isStream })`

4. `callKiMi(_, prompt, apiKey, model, history, isStream)`
   - 修改为: `callKiMi({ _, prompt, apiKey, model, history, isStream })`

5. `callGemini(_, prompt, apiKey, model, history, isStream)`
   - 修改为: `callGemini({ _, prompt, apiKey, model, history, isStream })`

### 2. AI处理器文件
**文件**: `src/main/features/handlers/ai/ai.ts`

#### 需要修改的方法调用:
1. `generateCommitMessage(_, prompt, aiConfig, isStream)`
   - 修改为: `generateCommitMessage({ _, prompt, aiConfig, isStream })`

2. `generateChatResponse(_, prompt, aiConfig, history, isStream)`
   - 修改为: `generateChatResponse({ _, prompt, aiConfig, history, isStream })`

### 3. Git扫描服务文件
**文件**: `src/main/features/services/git/git-scan.ts`

#### 需要修改的方法调用:
1. `generateChatResponse(null, prompt, aiConfig)`
   - 修改为: `generateChatResponse({ _: null, prompt, aiConfig })`

### 4. 股票分析服务文件
**文件**: `src/main/features/services/stock/stock.ts`

#### 需要修改的方法调用:
1. `this.aiService.generateCommitMessage(summaryDocument, aiConfig)`
   - 修改为: `this.aiService.generateCommitMessage({ prompt: summaryDocument, aiConfig })`

## 需要修改的文件列表
1. **第一阶段: 修改AI服务文件**
   - `src/main/features/services/ai/ai.ts` - AI服务核心文件，包含所有AI方法的实现

2. **第二阶段: 修改AI处理器文件**
   - `src/main/features/handlers/ai/ai.ts` - AI IPC处理器文件

3. **第三阶段: 修改Git扫描服务文件**
   - `src/main/features/services/git/git-scan.ts` - Git扫描服务文件

4. **第四阶段: 修改股票分析服务文件**
   - `src/main/features/services/stock/stock.ts` - 股票分析服务文件

5. **第五阶段: 修改Preload文件**
   - `src/preload/index.ts` - Preload主文件，包含API定义
   - `src/preload/index.d.ts` - Preload类型定义文件

6. **第六阶段: 修改Renderer API文件**
   - `src/renderer/src/api/ai.ts` - Renderer端AI API文件

7. **第七阶段: 修改Renderer Composables文件**
   - `src/renderer/src/composables/ai.ts` - Renderer端AI组合式函数文件

8. **第八阶段: 修改Renderer Stores文件**
   - `src/renderer/src/stores/chatStore.ts` - 聊天存储文件

## 实施步骤

### 第一阶段: 修改AI服务文件
1. 修改 `src/main/features/services/ai/ai.ts` 中的方法签名
2. 修改方法内部调用，确保参数传递正确

### 第二阶段: 修改AI处理器文件
1. 修改`ai:generate-commit-message`处理器的参数接收方式，从顺序参数改为对象参数
2. 修改`ai:chat`处理器的参数接收方式，从顺序参数改为对象参数
3. 更新处理器内部对AI方法的调用，保持对象传参方式

**具体修改**:
- 将`async (_, prompt: string, aiConfig: AiConfig, isStream: boolean)`改为`async (_, params: { prompt: string, aiConfig: AiConfig, isStream: boolean })`
- 将`async (_, prompt: string, aiConfig: AiConfig, history?: ChatMessage[], isStream?: boolean)`改为`async (_, params: { prompt: string, aiConfig: AiConfig, history?: ChatMessage[], isStream?: boolean })`
- 更新处理器内部调用，使用`params.prompt`、`params.aiConfig`等

### 第三阶段: 修改Git扫描服务文件
1. 修改 `src/main/features/services/git/git-scan.ts` 中的方法调用
2. 确保参数传递正确

### 第四阶段: 修改股票分析服务文件
1. 修改 `src/main/features/services/stock/stock.ts` 中的方法调用
2. 确保参数传递正确

### 第五阶段: 修改Preload文件
1. 修改`src/preload/index.ts`文件：
   - 将`aiChat`方法的参数从顺序传参改为对象传参
   - 修改为: `aiChat: (params: { prompt: string, aiConfig: AiConfig, history?: ChatMessage[], isStream?: boolean }) => Promise<any>`

2. 修改`src/preload/index.d.ts`文件：
   - 更新`aiChat`方法的类型定义
   - 修改为: `aiChat: (params: { prompt: string, aiConfig: AiConfig, history?: ChatMessage[], isStream?: boolean }) => Promise<AiChatResponse>`

### 第六阶段: 修改Renderer API文件
1. 修改`src/renderer/src/api/ai.ts`文件：
   - 将`aiChat`方法的参数从顺序传参改为对象传参
   - 修改为: `aiChat: (params: { prompt: string, config: AiConfig, history?: ChatMessage[], isStream?: boolean }) => Promise<any>`

### 第七阶段: 修改Renderer Composables文件
1. 修改`src/renderer/src/composables/ai.ts`文件：
   - 更新`sendAiMessage`函数中对`aiApi.aiChat`的调用
   - 修改为: `aiApi.aiChat({ prompt, config: _.cloneDeep(config || AiConfig.value), history, Stream })`

### 第八阶段: 修改Renderer Stores文件
1. 修改`src/renderer/src/stores/chatStore.ts`文件：
   - 检查是否有使用AI方法的地方，如有需要修改为对象传参

## 注意事项
1. 确保所有参数都是可选的，或者提供默认值
2. 保持向后兼容性，确保现有功能不受影响
3. 更新文档和注释，反映新的参数结构

## 进度跟踪
- [x] 第一阶段: 修改AI服务文件
- [x] 第二阶段: 修改AI处理器文件
- [x] 第三阶段: 修改Git扫描服务文件
- [x] 第四阶段: 修改股票分析服务文件
- [x] 第五阶段: 修改Preload文件
- [x] 第六阶段: 修改Renderer API文件
- [x] 第七阶段: 修改Renderer Composables文件
- [x] 第八阶段: 修改Renderer Stores文件
- [x] 测试所有修改
- [x] 更新文档

## 修改总结

本次AI方法参数重构任务已完成，包括以下修改：

1. **AI服务文件修改**：
   - 在`src/main/features/services/ai/ai.ts`中定义了参数接口，包括`GenerateCommitMessageParams`、`GenerateChatResponseParams`等
   - 修改了AI方法的参数类型，使用对象传参方式

2. **AI处理器文件修改**：
   - 在`src/main/features/handlers/ai/ai.ts`中修改了IPC处理器，使用对象传参方式
   - 更新了`generateCommitMessage`和`generateChatResponse`方法的参数结构
   - 修改了handle方法的参数接收方式，从顺序参数改为对象参数
   - 更新了preload文件中的aiChat方法调用，直接传递params对象

3. **Git扫描服务文件修改**：
   - 在`src/main/features/services/git/git-scan.ts`中更新了AI方法的调用方式
   - 修改了`aiAnalysisCommits`函数中的参数传递

4. **股票分析服务文件修改**：
   - 在`src/main/features/services/stock/stock.ts`中更新了AI方法的调用方式
   - 修改了`analyzeStock`方法中的参数传递

5. **Preload文件修改**：
   - 在`src/preload/index.ts`中修改了`aiChat`方法的参数定义，从顺序传参改为对象传参
   - 在`src/preload/index.d.ts`中更新了`aiChat`方法的类型定义

6. **Renderer API文件修改**：
   - 在`src/renderer/src/api/ai.ts`中修改了`aiChat`方法的参数定义和调用方式
   - 更新了参数结构，使用对象传参方式

7. **Renderer Composables文件修改**：
   - 在`src/renderer/src/composables/ai.ts`中更新了`sendAiMessage`函数中对`aiApi.aiChat`的调用
   - 修改为对象传参方式：`{ prompt, config: _.cloneDeep(config || AiConfig.value), history, isStream: Stream }`

8. **Renderer Stores文件修改**：
   - 检查了`src/renderer/src/stores/chatStore.ts`文件，确认无需修改
   - 检查了相关组件文件，确认所有AI方法调用已更新

### 修改优势

1. **代码可读性提升**：对象传参方式使参数含义更加明确，提高了代码的可读性
2. **代码可维护性增强**：使用参数接口定义，使代码结构更加清晰，便于后续维护
3. **灵活性提高**：对象传参方式使参数顺序不再重要，增加了调用的灵活性
4. **类型安全增强**：通过TypeScript接口定义，增强了类型安全性，减少了潜在的错误

### 测试结果

经过全面测试，所有修改均已验证正常工作，AI方法调用流程完整，从UI层到服务层的参数传递正确无误。