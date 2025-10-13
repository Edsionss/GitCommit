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
  name: string // 参数名称
  label: string // 显示标签
  type: ParameterType // 参数类型
  required?: boolean // 是否必填，默认false
  defaultValue?: any // 默认值
  options?: ParameterOption[] // 选项（用于SELECT类型）
  placeholder?: string // 占位符文本
  validation?: {
    // 验证规则
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

// 内置任务接口
export interface BuiltInTask {
  id: string
  name: string
  description: string
  params?: ParameterDefinition[]
  execute: (...args: any[]) => Promise<any>
}

// 简化的参数存储，避免使用 reflect-metadata
const parametersMetadata = new Map<any, Map<string, ParameterDefinition[]>>()

// 参数装饰器
export function Param(options: {
  label: string
  type: ParameterType
  required?: boolean
  defaultValue?: any
  options?: ParameterOption[]
  placeholder?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    // 获取或创建目标对象的元数据映射
    if (!parametersMetadata.has(target)) {
      parametersMetadata.set(target, new Map())
    }
    
    const targetMetadata = parametersMetadata.get(target)!
    
    // 获取现有的参数元数据
    const existingParameters = targetMetadata.get(propertyKey) || []

    // 创建参数定义
    const paramDefinition: ParameterDefinition = {
      name: `param${parameterIndex}`, // 默认参数名，将在后续处理中更新
      ...options
    }

    // 添加到参数数组
    existingParameters[parameterIndex] = paramDefinition
    targetMetadata.set(propertyKey, existingParameters)
  }
}

// 提取参数元数据的工具函数
export function extractParameters(
  taskInstance: any,
  methodName: string = 'execute'
): ParameterDefinition[] {
  // 获取目标类的元数据
  const constructor = taskInstance.constructor
  const targetMetadata = parametersMetadata.get(constructor)
  const parameters = targetMetadata?.get(methodName) || []

  // 尝试从函数签名中提取参数名
  const func = taskInstance[methodName]
  if (func && typeof func === 'function') {
    const funcStr = func.toString()
    const match = funcStr.match(/\(([^)]*)\)/)
    if (match) {
      const paramNames = match[1]
        .split(',')
        .map((param) => param.trim().split('=')[0].trim())
        .filter((name) => name)

      // 更新参数定义中的名称
      return parameters.map((param: ParameterDefinition, index: number) => ({
        ...param,
        name: paramNames[index] || `param${index}`
      }))
    }
  }

  return parameters
}
