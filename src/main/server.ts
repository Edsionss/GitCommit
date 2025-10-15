import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import { apiRegistry } from '@features/handlers/apiRegistry'

const PORT = 3001 // API 服务器端口

let serverInstance: any = null

/**
 * 创建 Express 应用实例并动态注册所有 API 路由
 */
function createServer(): Express {
  const app = express()

  // 配置中间件
  app.use(cors({ origin: '*' })) // 在生产中应配置更严格的来源
  app.use(express.json())

  console.log('[Server] Creating dynamic API routes...')

  // 遍历 API 注册表来创建路由
  apiRegistry.forEach(({ channel, method, handler }) => {
    // 将 IPC channel 'foo:bar' 转换为 API 路径 '/api/foo/bar'
    const path = `/api/${channel.replace(/:/g, '/')}`

    // 创建一个通用的 Express 处理器，它会调用我们原始的 IPC 处理器
    const expressHandler = async (req: Request, res: Response) => {
      try {
        let args: any[] = []

        // 根据 HTTP 方法决定从哪里获取参数
        if (method === 'get') {
          // 对于 GET, 参数来自 req.query。后端按顺序接收。
          args = Object.values(req.query)
        } else {
          // 对于 POST, 参数来自 req.body。
          // 假设前端会将所有参数打包成一个对象或数组
          args = Array.isArray(req.body) ? req.body : [req.body]
        }

        // 调用原始的 handler，第一个参数 event 传 null，因为它在 HTTP 上下文中不存在
        const result = await handler(null, ...args)
        res.json({ success: true, data: result })
      } catch (error: any) {
        console.error(`[Server] Error on route ${path}:`, error)
        res.status(500).json({ success: false, message: error.message })
      }
    }

    // 动态注册路由
    app[method](path, expressHandler)
    console.log(`[Server]  -> Registered route: [${method.toUpperCase()}] ${path}`)
  })

  console.log(`[Server] ✅ Created ${apiRegistry.length} dynamic API routes.`)
  return app
}

/**
 * 启动 API 服务器
 */
export function startServer(): Promise<void> {
  return new Promise((resolve) => {
    const server = createServer()
    serverInstance = server.listen(PORT, () => {
      console.log(`[Server] ✅ API server is running at http://localhost:${PORT}`)
      resolve()
    })
  })
}

/**
 * 停止 API 服务器
 */
export function stopServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (serverInstance) {
      serverInstance.close((err: any) => {
        if (err) {
          console.error('[Server] Error stopping server:', err)
          return reject(err)
        }
        console.log('[Server] API server stopped.')
        resolve()
      })
    } else {
      resolve()
    }
  })
}
