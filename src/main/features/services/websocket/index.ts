import { WebSocketServer, WebSocket } from 'ws'
import http from 'http'
import { handleMessage } from '@handlers/websocket'
import type { ChatMessage } from '@sharedType/WebSocket'
import { nanoid } from 'nanoid'
import { getLocalIpAddress } from '@nodeUtils/index'
import { networkInterfaces } from 'os'
import { flashMainWindow, getMainWindow } from '@main/index'

const PORT = 8888 // 定义 WebSocket 服务器端口
const HOST = '0.0.0.0' // 显式声明监听所有网络接口

let wss: WebSocketServer | null = null
let httpServer: http.Server | null = null
// 创建一个 Map 来存储客户端 ID 和昵称
const clients = new Map<WebSocket, { id: string; nickname: string | null }>()
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
    clients.set(ws, { id: clientId, nickname: null })
    console.log(`A new client connected with ID: ${clientId}`)

    ws.on('message', (message: string) => {
      try {
        const clientInfo = clients.get(ws)
        if (!clientInfo) return

        // 提取消息中的昵称，并检查是否是首次发言
        const incomingData = JSON.parse(message.toString())
        const newNickname = incomingData.nickname

        if (newNickname && !clientInfo.nickname) {
          // This is the first message with a nickname, so announce user has joined.
          clientInfo.nickname = newNickname
          const joinMessage: ChatMessage = {
            id: nanoid(),
            text: `"${newNickname}" 已加入房间`,
            sender: 'system',
            nickname: '系统消息',
            timestamp: Date.now(),
            isSystemMessage: true
          }
          broadcast(joinMessage)
        }

        // 将 clientId 传递给 handler
        const processedMessage = handleMessage(message.toString(), clientInfo.id)
        broadcast(processedMessage)
      } catch (error) {
        console.error('Failed to process message:', error)
      }
    })

    ws.on('close', () => {
      const clientInfo = clients.get(ws)
      if (clientInfo && clientInfo.nickname) {
        // Announce user has left.
        const leaveMessage: ChatMessage = {
          id: nanoid(),
          text: `"${clientInfo.nickname}" 已离开房间`,
          sender: 'system',
          nickname: '系统消息',
          timestamp: Date.now(),
          isSystemMessage: true
        }
        broadcast(leaveMessage)
      }
      console.log(`Client ${clientInfo?.id} disconnected.`)
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

  clients.forEach((clientInfo, client) => {
    if (client.readyState === WebSocket.OPEN) {
      // 为每个客户端定制消息，告诉它这条消息是不是自己发的
      const messageToSend = {
        ...message,
        isMe: message.sender === clientInfo.id
      }
      client.send(JSON.stringify(messageToSend))
    }
  })
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

// Function to find CognitoOcean hosts on the local network
export async function findAppHosts(port: number): Promise<string[]> {
  const nets = networkInterfaces()
  const results: string[] = []
  const promises: Promise<void>[] = []

  for (const name of Object.keys(nets)) {
    const netInfo = nets[name]
    if (!netInfo) continue

    for (const net of netInfo) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        const subnet = net.address.substring(0, net.address.lastIndexOf('.'))
        for (let i = 1; i < 255; i++) {
          const ip = `${subnet}.${i}`
          const promise = new Promise<void>((resolve) => {
            const options = {
              host: ip,
              port: port,
              path: '/ping',
              timeout: 500 // Short timeout for quick scanning
            }

            const req = http.get(options, (res) => {
              let data = ''
              if (res.statusCode === 200) {
                res.on('data', (chunk) => {
                  data += chunk
                })
                res.on('end', () => {
                  try {
                    const jsonData = JSON.parse(data)
                    if (jsonData.app === 'CognitoOcean') {
                      results.push(ip)
                    }
                  } catch (e) {
                    // JSON parsing error, not a valid host
                  }
                  resolve()
                })
              } else {
                res.resume() // Consume response data to free up memory
                resolve()
              }
            })

            req.on('timeout', () => {
              req.destroy()
              resolve()
            })

            req.on('error', (err) => {
              // Ignore connection errors (e.g., ECONNREFUSED)
              resolve()
            })
          })
          promises.push(promise)
        }
      }
    }
  }

  await Promise.all(promises)
  return results
}

export function handleSendDirectBroadcast(
  _event: Electron.IpcMainEvent,
  { targets, message }: { targets: string[]; message: { text: string; nickname: string } }
): void {
  const sourceIp = getLocalIpAddress() // 获取本机IP
  targets.forEach((ip) => {
    const ws = new WebSocket(`ws://${ip}:${PORT}`)

    ws.on('open', () => {
      const payload = {
        ...message,
        type: 'direct-broadcast',
        sourceIp // 添加源IP地址
      }
      ws.send(JSON.stringify(payload))
      ws.close() // 发送后立即关闭
    })

    ws.on('error', (err) => {
      console.error(`Failed to send direct broadcast to ${ip}:`, err.message)
      // Optional: Notify the renderer process about the failure
      getMainWindow()?.webContents.send('direct-broadcast-failed', { ip, error: err.message })
    })
  })
}
