import { AddSystemLogRequest } from '@sharedType/systemLog'
import { systemLogService, type SystemLogService } from '@services/systemLog'
/**
 * 系统日志工具类
 * 提供与 console 相同的方法接口，同时将日志存入数据库
 */
class SysLogger {
  private systemLogService: SystemLogService = systemLogService
  private isSavingToDatabase = false // 防止循环引用的标志

  constructor() {
    // 延迟加载服务，避免循环依赖
    // this.initService()
  }

  // private initService() {
  //   // try {
  //   //   // 动态导入服务，避免循环依赖
  //   //   // this.systemLogService = systemLogService
  //   // } catch (error) {
  //   //   console.error('Failed to initialize systemLogService:', error)
  //   // }
  // }

  /**
   * 记录普通日志
   * @param args - 日志内容，可以是多个参数
   */
  public log(...args: any[]): void {
    // 保留原有的控制台输出
    console.log(...args)

    // 将日志存入数据库
    this.saveLogToDatabase('log', args)
  }

  /**
   * 记录警告日志
   * @param args - 日志内容，可以是多个参数
   */
  public warn(...args: any[]): void {
    // 保留原有的控制台输出
    console.warn(...args)

    // 将日志存入数据库
    this.saveLogToDatabase('warn', args)
  }

  /**
   * 记录错误日志
   * @param args - 日志内容，可以是多个参数
   */
  public error(...args: any[]): void {
    // 保留原有的控制台输出
    console.error(...args)

    // 将日志存入数据库
    this.saveLogToDatabase('error', args)
  }

  /**
   * 记录信息日志
   * @param args - 日志内容，可以是多个参数
   */
  public info(...args: any[]): void {
    // 保留原有的控制台输出
    console.info(...args)

    // 将日志存入数据库
    this.saveLogToDatabase('log', args)
  }

  /**
   * 记录调试日志
   * @param args - 日志内容，可以是多个参数
   */
  public debug(...args: any[]): void {
    // 保留原有的控制台输出
    console.debug(...args)

    // 将日志存入数据库
    this.saveLogToDatabase('log', args)
  }

  /**
   * 将日志保存到数据库
   * @param level - 日志级别
   * @param args - 日志内容数组
   */
  private saveLogToDatabase(level: 'log' | 'warn' | 'error', args: any[]): void {
    // 如果正在保存日志到数据库，则跳过以防止循环引用
    if (this.isSavingToDatabase) {
      return
    }

    try {
      // 如果服务未初始化，尝试重新初始化
      if (!this.systemLogService) {
        // this.initService()
      }

      // 如果服务仍然不可用，跳过数据库存储
      if (!this.systemLogService) {
        return
      }

      // 将所有参数转换为字符串
      const content = args
        .map((arg) => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg)
            } catch (e) {
              return String(arg)
            }
          }
          return String(arg)
        })
        .join(' ')

      // 构建日志请求对象
      const logRequest: AddSystemLogRequest = {
        content,
        level
      }

      // 设置标志，防止循环引用
      this.isSavingToDatabase = true
      
      // 异步保存日志，不阻塞主线程
      this.systemLogService.addSystemLog(logRequest).catch((error) => {
        // 使用原生 console.error 而不是 sysLogger.error，防止循环引用
        console.error('Failed to save system log:', error)
      }).finally(() => {
        // 无论成功或失败，都要重置标志
        this.isSavingToDatabase = false
      })
    } catch (error) {
      // 使用原生 console.error 而不是 sysLogger.error，防止循环引用
      console.error('Error in saveLogToDatabase:', error)
      // 确保在出错时也重置标志
      this.isSavingToDatabase = false
    }
  }
}

// 导出单例实例
export const sysLogger = new SysLogger()

// 导出默认实例
export default sysLogger
