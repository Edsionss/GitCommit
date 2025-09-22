import { WebSocketServer, WebSocket } from 'ws'
import http from 'http'
import type { ChatMessage } from '@sharedType/WebSocket'
import { nanoid } from 'nanoid'
import { getLocalIpAddress } from '@nodeUtils/index'
import { getMainWindow } from '@main/index'
import { networkInterfaces } from 'os'
import { loadSystemNotify } from '@nodeUtils/index'

const PORT = 8888
const HOST = '0.0.0.0'

let wss: WebSocketServer | null = null
let httpServer: http.Server | null = null
// 一个 Map 来存储客户端的 ID
const clients = new Map<WebSocket, string>()
// 用一个集合来存放已经处理过的广播ID，防止重复处理
const processedBroadcasts = new Set<string>()

export function startWebSocketServer() {
  if (wss) {
    console.log('WebSocket server is already running.')
    return
  }

  httpServer = http.createServer((req, res) => {
    if (req.url === '/ping' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ app: 'CognitoOcean' }))
    } else {
      res.writeHead(404)
      res.end()
    }
  })

  wss = new WebSocketServer({ server: httpServer })

  wss.on('connection', (ws: WebSocket) => {
    const clientId = nanoid()
    clients.set(ws, clientId)
    console.log(`A new client connected with ID: ${clientId} `)
    ws.on('message', (message: string) => {
      try {
        const incomingData = JSON.parse(message.toString())
        const { broadcastType, originIp, id } = incomingData
        const myIp = getLocalIpAddress() || 'unknown'
        // 检查是否是广播消息
        if (broadcastType) {
          if (originIp === myIp) {
            console.log(`[Broadcast] 忽略来自我自己的消息 ${id}.`)
            return
          }

          if (broadcastType === 'global') {
            // **防止重复处理同一个广播消息**
            if (processedBroadcasts.has(id)) {
              console.log(`[Global Broadcast] Ignoring duplicate broadcast ${id}`)
              return
            }
            loadSystemNotify()
            console.log(`[Global Broadcast] Received broadcast ${id} from ${originIp}`)
            // 记录已处理
            processedBroadcasts.add(id)
            // 可选：定时清理这个 Set，防止内存无限增长
            setTimeout(() => processedBroadcasts.delete(id), 60000) // 1分钟后清理

            // 准备要在本地广播的消息
            const localMessage: ChatMessage = {
              id: nanoid(),
              text: incomingData.text,
              sender: 'global-broadcaster', // 或使用 originIp
              nickname: incomingData.nickname,
              timestamp: Date.now(),
              broadcastType: 'global',
              originIp: incomingData.originIp
            }
            // **核心：在本地进行广播**
            broadcast(localMessage)
            // **重要：不再向其他网络节点转发！**
            // 这样就切断了消息风暴的循环。
            return // 处理完毕
          } else if (broadcastType === 'direct') {
            // 检查是否是直接广播消息
            console.log('Received direct broadcast:', incomingData)
            loadSystemNotify()
            getMainWindow()?.webContents.send('direct-broadcast-received', incomingData)
            return // 不再继续处理
          }
        }
        // 处理普通聊天室消息
        loadSystemNotify('收到一条消息，点击查看')
        const processedMessage = handleMessage(message.toString(), clientId)
        broadcast(processedMessage)
      } catch (error) {
        console.error('Failed to process message:', error)
      }
    })

    ws.on('close', () => {
      console.log(`Client ${clients.get(ws)} disconnected.`)
      clients.delete(ws)
    })

    ws.on('error', (error) => {
      console.error('WebSocket error:', error)
    })
  })

  httpServer.listen(PORT, HOST, () => {
    console.log(`Server (HTTP + WebSocket) started on ws://localhost:${PORT}`)
  })
}

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

function broadcast(message: ChatMessage) {
  if (!wss) return
  clients.forEach((clientId, ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      const messageToSend = { ...message, isMe: message.sender === clientId }
      ws.send(JSON.stringify(messageToSend))
    }
  })
}

export function handleSendRoomBroadcast(
  _event: Electron.IpcMainEvent,
  message: { text: string; nickname: string; token: string }
): void {
  try {
    const globalSenderId = 'room-broadcaster'
    const processedMessage = handleMessage(JSON.stringify(message), globalSenderId)
    const broadcastMessage: ChatMessage = {
      ...processedMessage,
      broadcastType: 'room',
      token: undefined
    }
    broadcast(broadcastMessage)
  } catch (error) {
    console.error('Failed to send room broadcast:', error)
  }
}

/**
 * 处理从客户端接收到的消息
 * @param message - 从客户端收到的原始消息字符串
 * @returns - 经过处理、准备广播的 ChatMessage 对象
 */
export function handleMessage(message: string, clientId: string): ChatMessage {
  // 客户端现在会发送 { text: '...', nickname: '...', token: '...' }
  const incomingData = JSON.parse(message)

  if (!incomingData.text || !incomingData.nickname) {
    throw new Error('Invalid message payload. "text" and "nickname" are required.')
  }

  const processedMessage: ChatMessage = {
    id: nanoid(),
    text: incomingData.text,
    sender: clientId, // 使用一个唯一标识符来代表发送者
    nickname: incomingData.nickname, // 使用客户端传来的昵称
    timestamp: Date.now(),
    token: incomingData.token // 将 token 传递下去
  }

  console.log('Processed message:', processedMessage)
  return processedMessage
}

// 处理发送给指定目标的直接广播
export function handleSendDirectBroadcast(
  _event: Electron.IpcMainEvent,
  { targets, message }: { targets: string[]; message: { text: string; nickname: string } }
): void {
  const originIp = getLocalIpAddress() // 获取本机IP
  targets.forEach((ip) => {
    const ws = new WebSocket(`ws://${ip}:${PORT}`)
    ws.on('open', () => {
      const payload = {
        ...message,
        broadcastType: 'direct',
        timestamp: Date.now(),
        id: nanoid(), // **为每次广播创建一个唯一ID，防止重复处理**
        originIp // 添加源IP地址
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

// 新增一个函数，专门用于发起全局广播
export async function handleSendGlobalBroadcast(
  _event: Electron.IpcMainEvent,
  message: { text: string; nickname: string }
): Promise<void> {
  try {
    // 1. 发现网络中的所有伙伴节点
    const allHosts = await findAppHosts(PORT)

    // 2. 获取本机IP，以便过滤掉自己
    const myIp = getLocalIpAddress() || 'unknown'

    // 3. 准备要发送的负载 (payload)
    const payload = {
      ...message,
      timestamp: Date.now(),
      broadcastType: 'global',
      sender: 'global-broadcaster', // 发起者不需要特定ID
      // type: 'global-broadcast', // **使用新的消息类型**
      originIp: myIp, // **标记消息的原始来源IP**
      id: nanoid() // **为每次广播创建一个唯一ID，防止重复处理**
    }

    console.log(`[Global Broadcast] Initiating broadcast ${payload.id} to hosts:`, allHosts)

    // 4. 向所有【其他】节点发送这个全局广播消息
    allHosts.forEach((ip) => {
      // **关键：过滤掉自己，不要向自己发送网络消息**
      if (ip === myIp) {
        return
      }

      const ws = new WebSocket(`ws://${ip}:${PORT}`)

      ws.on('open', () => {
        ws.send(JSON.stringify(payload))
        ws.close() // 发送后立即关闭
      })

      ws.on('error', (err) => {
        console.error(`[Global Broadcast] Failed to send to ${ip}:`, err.message)
      })
    })

    // 5. **重要：发起者自己也需要在本地进行广播**
    // 这样发起者自己的UI也能立即看到消息
    const localMessage: ChatMessage = {
      id: nanoid(),
      text: message.text,
      sender: 'global-broadcaster',
      nickname: message.nickname,
      timestamp: Date.now(),
      broadcastType: 'global',
      originIp: myIp
    }
    broadcast(localMessage) // 使用你现有的 broadcast 函数
  } catch (error) {
    console.error('Failed to initiate global broadcast:', error)
  }
}

export function handleGetWsAddress() {
  const ip = getLocalIpAddress()
  if (ip) {
    return `ws://${ip}:${PORT}`
  }
  return `ws://localhost:${PORT}`
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
