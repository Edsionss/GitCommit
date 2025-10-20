/**
 * @file AI Tools
 * @description Defines tools that can be called by AI for function calling.
 */

/**
 * 测试工具函数 - 返回一个随机数字
 * @param params 参数对象
 * @returns 包含随机数字的对象
 */
export async function test(params: { min?: number; max?: number }): Promise<{ result: number; message: string }> {
  const min = params.min || 0
  const max = params.max || 100
  
  // 生成指定范围内的随机整数
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min
  
  return {
    result: randomNumber,
    message: `成功生成随机数字 ${randomNumber}，范围在 ${min} 到 ${max} 之间`
  }
}

// 导出所有工具函数，以便在aiFunctionCalling.ts中使用
export default {
  test
}