import { WebSocketServer, WebSocket } from 'ws'
import http from 'http'
import { handleMessage } from '@handlers/websocket'
import type { ChatMessage } from '@sharedType/Chat'
import { nanoid } from 'nanoid'
import { getLocalIpAddress } from '@nodeUtils/index'
import { flashMainWindow } from '@main/index' // 导入 flashMainWindow

const PORT = 8888 // 定义 WebSocket 服务器端口
const HOST = '0.0.0.0' // 显式声明监听所有网络接口

let wss: WebSocketServer | null = null
let httpServer: http.Server | null = null
// 创建一个 Map 来存储客户端 ID
const clients = new Map<WebSocket, string>()
/**
 * 启动 WebSocket 服务器
 */
export function startWebSocketServer() {
  if (wss) {
    console.log('WebSocket server is already running.')
    return
  }

  // 1. Create HTTP server
  httpServer = http.createServer((req, res) => {
    // 2. Add ping handler
    if (req.url === '/ping' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ app: 'CognitoOcean' }))
    } else {
      res.writeHead(404)
      res.end()
    }
  })

  // 3. Create WebSocket server and attach it to the HTTP server
  wss = new WebSocketServer({ server: httpServer })

  wss.on('connection', (ws: WebSocket) => {
    const clientId = nanoid() // 为每个新连接生成一个唯一ID
    clients.set(ws, clientId)
    console.log(`A new client connected with ID: ${clientId}`)

    ws.on('message', (message: string) => {
      try {
        // 将 clientId 传递给 handler
        const processedMessage = handleMessage(message.toString(), clientId)
        broadcast(processedMessage)
      } catch (error) {
        console.error('Failed to process message:', error)
      }
    })

    ws.on('close', () => {
      console.log(`Client ${clients.get(ws)} disconnected.`)
      clients.delete(ws) // 客户端断开时移除
    })

    ws.on('error', (error) => {
      console.error('WebSocket error:', error)
    })
  })

  // 4. Start listening
  httpServer.listen(PORT, HOST, () => {
    console.log(`Server (HTTP + WebSocket) started on ws://localhost:${PORT}`)
  })
}

/**
 * 停止 WebSocket 服务器
 */
export function stopWebSocketServer() {
  if (wss) {
    wss.close(() => {
      console.log('WebSocket server stopped.')
      wss = null
    })
  }
  if (httpServer) {
    httpServer.close(() => {
      console.log('HTTP server stopped.')
      httpServer = null
    })
  }
}

/**
 * 广播消息给所有客户端
 * @param message - 要广播的 ChatMessage 对象
 */
function broadcast(message: ChatMessage) {
  if (!wss) return

  // 在广播前触发任务栏闪烁
  flashMainWindow()

  clients.forEach((id, client) => {
    if (client.readyState === WebSocket.OPEN) {
      // 为每个客户端定制消息，告诉它这条消息是不是自己发的
      const messageToSend = {
        ...message,
        isMe: message.sender === id
      }
      client.send(JSON.stringify(messageToSend))
    }
  })
}

/**
 * 处理从渲染器发送的全局广播请求
 * @param _event - IpcMainEvent
 * @param message - 包含 text, nickname, 和 token 的对象
 */
export function handleSendGlobalBroadcast(
  _event: Electron.IpcMainEvent,
  message: { text: string; nickname: string; token: string }
): void {
  try {
    // 模拟一个客户端ID用于全局消息
    const globalSenderId = 'global-broadcaster'
    const processedMessage = handleMessage(JSON.stringify(message), globalSenderId)

    // 标记为全局消息
    const globalMessage = {
      ...processedMessage,
      isGlobal: true,
      // 全局消息不属于任何特定房间，所以清空 token
      token: undefined
    }

    broadcast(globalMessage)
  } catch (error) {
    console.error('Failed to send global broadcast:', error)
  }
}

// 获取 WebSocket 地址
export function handleGetWsAddress() {
  const ip = getLocalIpAddress()
  const port = 8888 // 确保这里的端口和 server.ts 中的一致
  if (ip) {
    return `ws://${ip}:${port}`
  }
  // 如果获取不到局域网IP，则回退到 localhost (适用于单机测试)
  return `ws://localhost:${port}`
}
