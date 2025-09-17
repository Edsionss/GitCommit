import { defineStore } from 'pinia'
import { ref, nextTick } from 'vue'
import type { ChatMessage } from '@sharedType/Chat'
import { webSocketApi } from '@api/webSocket'
import { message as antMessage, notification } from 'ant-design-vue'
import { nanoid } from 'nanoid'

export const useWebSocketStore = defineStore('websocket', () => {
  // --- State ---
  const messages = ref<ChatMessage[]>([])
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const connectionStatus = ref('未连接')
  const nickname = ref('')
  const modeSelected = ref(false)
  const isHost = ref(false)
  const hostIpForDisplay = ref('')
  const roomToken = ref('')
  const inputToken = ref('')

  let ws: WebSocket | null = null
  let serverAddress = ''

  // --- Actions ---

  const connectWebSocket = () => {
    if (ws || !serverAddress) return

    console.log(`正在连接到 WebSocket 服务器: ${serverAddress}`)
    ws = new WebSocket(serverAddress)
    connectionStatus.value = '正在连接...'
    isConnecting.value = true

    ws.onopen = () => {
      console.log(`[WebSocket] 连接成功: ${serverAddress}`)
      isConnected.value = true
      isConnecting.value = false
      connectionStatus.value = '已连接'
      modeSelected.value = true
    }

    ws.onmessage = (event) => {
      try {
        const message: ChatMessage = JSON.parse(event.data)

        // 检查是否是全局消息
        if (message.isGlobal) {
          notification.info({
            message: `全局广播 - 来自: ${message.nickname}`,
            description: message.text,
            placement: 'topRight'
          })
          return // 全局消息不添加到聊天列表
        }

        messages.value.push(message)
        nextTick(() => {
          const listEl = document.querySelector('.message-area')
          if (listEl) {
            listEl.scrollTop = listEl.scrollHeight
          }
        })
      } catch (error) {
        console.error('解析消息失败:', error)
      }
    }

    ws.onclose = (event) => {
      console.log(`[WebSocket] 连接关闭`, event)
      isConnected.value = false
      isConnecting.value = false
      connectionStatus.value = '已断开. 正在重试...'
      ws = null
      if (!isHost.value) {
        setTimeout(connectWebSocket, 3000)
      } else {
        connectionStatus.value = '主机服务器已关闭'
      }
    }

    ws.onerror = (error) => {
      console.error('[WebSocket] 发生错误:', error)
      isConnecting.value = false
      connectionStatus.value = '连接错误'
      antMessage.error(`无法连接到 ${serverAddress}，请检查地址和令牌是否正确。`)
      ws?.close()
    }
  }

  const startHosting = async () => {
    try {
      await webSocketApi.startWsServer()
      const address = await webSocketApi.getWsAddress()

      if (!address || address.includes('localhost')) {
        antMessage.error('无法获取有效的局域网IP地址，无法作为主机。')
        return
      }

      serverAddress = address
      hostIpForDisplay.value = address.replace('ws://', '').split(':')[0]
      antMessage.success(`主机已在 ${address} 启动！`)

      isHost.value = true
      roomToken.value = nanoid(8)
      nickname.value = `主机-${nanoid(6)}`
      connectWebSocket()
    } catch (error) {
      console.error('启动主机失败:', error)
      antMessage.error('启动主机失败，请查看控制台日志。')
    }
  }

  const joinRoom = (ip: string, token: string) => {
    serverAddress = `ws://${ip.trim()}:8888`
    inputToken.value = token
    nickname.value = `访客-${nanoid(6)}`
    connectWebSocket()
  }

  const sendMessage = (text: string) => {
    if (text.trim() && ws && isConnected.value) {
      const messagePayload = {
        text,
        nickname: nickname.value,
        token: isHost.value ? roomToken.value : inputToken.value
      }
      ws.send(JSON.stringify(messagePayload))
    }
  }

  const sendGlobalBroadcast = (text: string) => {
    if (text.trim() && isHost.value) {
      const messagePayload = {
        text,
        nickname: nickname.value,
        token: 'global' // Or any identifier for global messages
      }
      webSocketApi.sendGlobalBroadcast(messagePayload)
      antMessage.success('全局广播已发送')
    }
  }

  const disconnect = () => {
    if (ws) {
      ws.onclose = null // 防止重连
      ws.close()
      ws = null
    }
    isConnected.value = false
    modeSelected.value = false
    messages.value = []
    isHost.value = false
    roomToken.value = ''
    inputToken.value = ''
    nickname.value = ''
    connectionStatus.value = '未连接'
  }

  return {
    messages,
    isConnected,
    isConnecting,
    connectionStatus,
    nickname,
    modeSelected,
    isHost,
    hostIpForDisplay,
    roomToken,
    inputToken,
    startHosting,
    joinRoom,
    sendMessage,
    sendGlobalBroadcast,
    disconnect
  }
})
