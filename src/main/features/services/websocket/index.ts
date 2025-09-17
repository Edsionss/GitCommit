import { WebSocketServer, WebSocket } from 'ws'
import http from 'http'
import { handleMessage } from '@handlers/websocket'
import type { ChatMessage } from '@sharedType/Chat'
import { nanoid } from 'nanoid'
import { getLocalIpAddress } from '@nodeUtils/index'
import { flashMainWindow, getMainWindow } from '@main/index'

const PORT = 8888
const HOST = '0.0.0.0'

let wss: WebSocketServer | null = null
let httpServer: http.Server | null = null
const clients = new Map<WebSocket, string>()

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
    console.log(`A new client connected with ID: ${clientId}`)

    ws.on('message', (message: string) => {
      try {
        const incomingData = JSON.parse(message.toString())

        // 检查是否是直接广播消息
        if (incomingData.type === 'direct-broadcast') {
          console.log('Received direct broadcast:', incomingData)
          flashMainWindow()
          getMainWindow()?.webContents.send('direct-broadcast-received', incomingData)
          return // 不再继续处理
        }

        // 处理普通聊天室消息
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
  flashMainWindow()
  clients.forEach((id, client) => {
    if (client.readyState === WebSocket.OPEN) {
      const messageToSend = { ...message, isMe: message.sender === id }
      client.send(JSON.stringify(messageToSend))
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
    const globalMessage = { ...processedMessage, isGlobal: true, token: undefined }
    broadcast(globalMessage)
  } catch (error) {
    console.error('Failed to send room broadcast:', error)
  }
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

export function handleGetWsAddress() {
  const ip = getLocalIpAddress()
  if (ip) {
    return `ws://${ip}:${PORT}`
  }
  return `ws://localhost:${PORT}`
}
