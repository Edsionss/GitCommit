import { sysLogger } from './sysLogger'

/**
 * 测试系统日志功能
 */
async function testSystemLogger() {
  console.log('开始测试系统日志功能...')
  
  // 测试不同级别的日志
  sysLogger.log('这是一条普通日志', { data: 'test', number: 123 })
  sysLogger.warn('这是一条警告日志', { warning: 'test warning' })
  sysLogger.error('这是一条错误日志', new Error('测试错误'))
  sysLogger.info('这是一条信息日志', { info: 'test info' })
  sysLogger.debug('这是一条调试日志', { debug: 'test debug' })
  
  // 等待一段时间，确保日志保存到数据库
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 获取系统日志服务并查询日志
  try {
    const { systemLogService } = require('../features/services/systemLog')
    const result = await systemLogService.getSystemLogs({ page: 1, pageSize: 10 })
    
    console.log(`成功获取到 ${result.total} 条日志记录`)
    console.log('最近的日志记录:')
    result.records.forEach((log, index) => {
      console.log(`${index + 1}. [${log.level}] ${log.timestamp}: ${log.content}`)
    })
    
    if (result.total > 0) {
      console.log('✅ 系统日志功能测试成功！')
    } else {
      console.log('❌ 系统日志功能测试失败：未找到日志记录')
    }
  } catch (error) {
    console.error('❌ 系统日志功能测试失败:', error)
  }
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  testSystemLogger()
}

export { testSystemLogger }