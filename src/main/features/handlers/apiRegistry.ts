import { IpcMainInvokeEvent } from 'electron'
// 导入所有需要的服务
// import { applicationService, gitService } from '@services/index'

// 这是一个模拟的服务，以便在没有完全实现服务时代码能够工作
const applicationService = {
  getAppVersion: async () => '0.5.0-mock'
}
const gitService = {
  getCommitHistory: async (repoPath: string) => [
    { id: 'mock-commit-1', message: `feat: initial commit for ${repoPath}` }
  ]
}

// 定义 API 处理器函数的类型
// (event, ...args) 是 IpcMain.handle 的标准签名
type ApiHandler = (event: IpcMainInvokeEvent | null, ...args: any[]) => Promise<any>

// 定义我们的 API 注册表条目类型
export interface ApiDefinition {
  channel: string
  method: 'get' | 'post'
  handler: ApiHandler
}

// 创建并导出 API 注册表
// 在这里，我们将集中定义所有的后端 API
export const apiRegistry: ApiDefinition[] = [
  {
    channel: 'app:get-version',
    method: 'get',
    handler: async (_event) => applicationService.getAppVersion()
  },
  {
    channel: 'git:get-commit-history',
    method: 'get',
    handler: async (_event, repoPath: string) => gitService.getCommitHistory(repoPath)
  }
  // {
  //   channel: 'some:post-data',
  //   method: 'post',
  //   handler: async (_event, data: { name: string; value: number }) => {
  //     // ...处理 POST 数据的逻辑
  //     console.log('Received data:', data)
  //     return { success: true, received: data }
  //   }
  // }
  // ... 在这里添加所有其他的 API
]
