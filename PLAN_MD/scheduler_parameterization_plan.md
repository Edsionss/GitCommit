# 定时任务系统参数化改造计划

## 概述
本计划旨在改造定时任务系统，使其支持内置任务的参数化配置，允许用户为内置任务提供自定义参数，并实现前端动态表单渲染。

## 需求分析
1. 在`BuiltInTask`接口中添加参数定义，使每个内置任务可以接收自定义参数
2. 前端根据参数定义动态渲染表单，允许用户输入参数值
3. 后端接收这些参数并在执行内置任务时使用
4. 考虑如何自动或半自动地生成这些参数定义，减少手动编写的工作量

## 技术方案

### 1. 参数定义结构设计

#### 1.1 参数类型定义
```typescript
// 参数类型枚举
export enum ParameterType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  DATE = 'date',
  TIME = 'time'
}

// 参数选项（用于SELECT类型）
export interface ParameterOption {
  label: string
  value: string | number
}

// 单个参数定义
export interface ParameterDefinition {
  name: string              // 参数名称
  label: string             // 显示标签
  type: ParameterType       // 参数类型
  required?: boolean        // 是否必填，默认false
  defaultValue?: any        // 默认值
  options?: ParameterOption[] // 选项（用于SELECT类型）
  placeholder?: string      // 占位符文本
  validation?: {            // 验证规则
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  }
}

// BuiltInTask接口扩展
export interface BuiltInTask {
  id: string
  name: string
  description: string
  params: ParameterDefinition[]  // 参数定义数组
  execute: (params?: Record<string, any>) => Promise<any>
}
```

#### 1.2 示例参数定义
```typescript
// 发送通知任务的参数定义
{
  id: 'send-notification',
  name: '发送通知',
  description: '发送系统通知，可自定义标题和内容。',
  params: [
    {
      name: 'title',
      label: '通知标题',
      type: ParameterType.STRING,
      required: true,
      defaultValue: '定时任务通知',
      placeholder: '请输入通知标题'
    },
    {
      name: 'message',
      label: '通知内容',
      type: ParameterType.TEXTAREA,
      required: true,
      defaultValue: '定时任务已执行',
      placeholder: '请输入通知内容'
    }
  ],
  execute: async (params) => {
    // 使用params.title和params.message
  }
}
```

### 2. 后端实现

#### 2.1 修改builtInTasks.ts
1. 更新`BuiltInTask`接口，添加`params`属性
2. 为每个内置任务添加参数定义
3. 更新`execute`方法签名，接收参数对象
4. 实现参数验证和默认值处理

#### 2.2 修改scheduler/index.ts
1. 更新`executeAction`方法，处理参数传递
2. 实现参数序列化和反序列化逻辑
3. 添加参数验证和错误处理

#### 2.3 数据库存储
1. 更新`scheduled_tasks`表结构，添加`action_params`字段存储参数JSON
2. 修改相关的CRUD操作，支持参数的存储和检索

### 3. 前端实现

#### 3.1 修改TaskForm.vue
1. 根据选中的内置任务动态渲染参数表单
2. 实现参数类型对应的表单控件
3. 添加参数验证和默认值处理
4. 实现参数的序列化和提交

#### 3.2 参数表单组件
1. 创建`ParameterForm`组件，根据参数定义渲染表单
2. 支持不同参数类型的输入控件
3. 实现参数验证和错误提示

#### 3.3 API调用
1. 更新API调用，支持参数的传递
2. 修改任务创建和更新逻辑，包含参数处理

### 4. 参数动态生成方案

#### 4.1 方案一：TypeScript装饰器（推荐）
```typescript
// 定义参数装饰器
function Param(options: {
  label: string;
  type: ParameterType;
  required?: boolean;
  defaultValue?: any;
  // 其他配置...
}) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    // 存储参数元数据
  }
}

// 使用示例
class NotificationTask {
  async execute(
    @Param({ label: '通知标题', type: ParameterType.STRING, required: true })
    title: string,
    @Param({ label: '通知内容', type: ParameterType.TEXTAREA, required: true })
    message: string
  ) {
    // 执行逻辑
  }
}

// 提取参数元数据的工具函数
function extractParameters(taskInstance: any): ParameterDefinition[] {
  // 实现提取逻辑
}
```

#### 4.2 方案二：函数字符串解析
```typescript
// 解析函数字符串提取参数名
function extractParameterNames(func: Function): string[] {
  const funcStr = func.toString();
  const match = funcStr.match(/\(([^)]*)\)/);
  if (!match) return [];
  
  return match[1].split(',').map(param => param.trim().split('=')[0].trim());
}

// 结合手动定义的类型信息生成完整参数定义
```

#### 4.3 方案三：手动定义参数元数据
```typescript
// 为每个任务明确定义参数元数据
const notificationTaskParams: ParameterDefinition[] = [
  {
    name: 'title',
    label: '通知标题',
    type: ParameterType.STRING,
    required: true,
    defaultValue: '定时任务通知'
  },
  // ...
];

// 在任务定义中引用
{
  id: 'send-notification',
  name: '发送通知',
  description: '...',
  params: notificationTaskParams,
  execute: async (params) => { /* ... */ }
}
```

### 5. 实施步骤

1. **第一阶段：基础结构**
   - 定义参数类型和接口
   - 更新`BuiltInTask`接口
   - 为现有内置任务添加基本参数定义

2. **第二阶段：后端实现**
   - 修改`builtInTasks.ts`，添加参数定义和更新execute方法
   - 更新scheduler服务，支持参数传递
   - 修改数据库结构，添加参数存储

3. **第三阶段：前端实现**
   - 修改TaskForm.vue，支持动态参数表单
   - 实现参数表单组件
   - 更新API调用，支持参数传递

4. **第四阶段：参数动态生成**
   - 实现选定的参数动态生成方案
   - 创建工具函数，简化参数定义过程
   - 优化开发体验

5. **第五阶段：测试与优化**
   - 编写单元测试和集成测试
   - 性能优化
   - 文档更新

## 预期效果

1. 用户可以为内置任务提供自定义参数，如通知的标题和内容
2. 前端根据参数定义自动渲染表单，提供良好的用户体验
3. 后端正确接收和处理参数，执行任务时使用这些参数
4. 开发者可以方便地为新内置任务定义参数，减少重复工作

## 风险与挑战

1. 参数验证和类型安全
2. 前端表单动态渲染的复杂性
3. 参数序列化和反序列化的兼容性
4. 数据库迁移和向后兼容性

## 解决方案

1. 使用TypeScript的类型系统确保类型安全
2. 设计灵活的表单组件，支持各种参数类型
3. 实现健壮的序列化/反序列化逻辑，添加版本控制
4. 提供数据库迁移脚本，确保平滑升级

## 总结

本计划将使定时任务系统更加灵活和可扩展，允许用户自定义内置任务的参数，同时提供良好的开发体验。通过分阶段实施，可以确保系统的稳定性和可维护性。