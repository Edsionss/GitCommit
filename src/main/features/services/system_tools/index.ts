import { exec } from 'child_process'

/**
 * 使用 setx 命令永久设置一个用户级环境变量。
 * @param {string} key 环境变量的名称
 * @param {string} value 环境变量的值
 */
function setPermanentEnvVar(key: string, value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (process.platform !== 'win32') {
      return reject(new Error('此功能仅支持 Windows 系统。'))
    }
    const command = `setx ${key} "${value}"`
    exec(command, (error) => {
      if (error) {
        console.error(`设置环境变量 "${key}" 时出错:`, error)
        return reject(error)
      }
      console.log(`成功设置环境变量 "${key}"。请重启应用或终端以使其生效。`)
      resolve()
    })
  })
}

export class SystemToolsService {
  /**
   * 安排一个定时关机任务，该操作会覆盖任何已存在的关机任务。
   * @param seconds 多少秒后关机
   */
  public scheduleShutdown(seconds: number): Promise<string> {
    return new Promise((resolve, reject) => {
      if (process.platform !== 'win32') {
        return reject(new Error('此功能仅支持 Windows 系统。'))
      }
      // 使用 & 连接命令：先尝试取消，然后立即设置新任务。
      // 无论取消成功与否（比如之前没有任务），都会继续执行设置新任务的命令。
      const command = `shutdown -a & shutdown -s -t ${seconds}`
      exec(command, (error, stdout, stderr) => {
        // shutdown -a 在没有任务时可能会在 stderr 中输出信息，但不应视为致命错误
        // 主要判断 shutdown -s 是否成功
        if (error && !stderr.includes('1116')) { // 1116 是“没有正在进行的关机”的错误代码
           // 检查是否包含真正的错误信息
           const errStr = stderr.toString()
           if(errStr.includes('A system shutdown has not been scheduled')){
             // 这是 `shutdown -a` 的正常“失败”，可以忽略
           } else {
             return reject(new Error(errStr || error.message));
           }
        }
        resolve(stdout || `新任务已设定，将在 ${Math.round(seconds / 60)} 分钟后关机。`)
      })
    })
  }

  /**
   * 取消已安排的定时关机任务。
   */
  public cancelShutdown(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (process.platform !== 'win32') {
        return reject(new Error('此功能仅支持 Windows 系统。'))
      }
      const command = `shutdown -a`
      exec(command, (error, stdout, stderr) => {
        if (error) {
          // `shutdown -a` 在没有计划时会返回错误，这是正常行为
          if (stderr.includes('1116') || stderr.includes('无法中止系统关闭')) {
            return resolve('当前没有待处理的关机计划。')
          }
          return reject(error)
        }
        resolve(stdout || '已成功取消所有定时关机计划。')
      })
    })
  }

  /**
   * 获取一个环境变量的值。
   * @param key 环境变量的名称
   */
  public getEnvVar(key: string): string | undefined {
    return process.env[key]
  }

  /**
   * 设置一个永久的用户级环境变量。
   * @param key 环境变量的名称
   * @param value 环境变量的值
   */
  public async setEnvVar(key: string, value: string): Promise<void> {
    await setPermanentEnvVar(key, value)
  }
}

export const systemToolsService = new SystemToolsService()