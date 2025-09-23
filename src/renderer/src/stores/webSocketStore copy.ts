import { defineStore } from 'pinia'
import { ref, nextTick } from 'vue'
import type { ChatMessage } from '@sharedType/WebSocket'
import { webSocketApi } from '@api/webSocket'
import { message as antMessage, notification } from 'ant-design-vue'
import { nanoid } from 'nanoid'
import { loadSystemNotify } from '@utils/index'

export const useWebSocketStore = defineStore('websocket', () => {
  // --- State ---
  const messages = ref<ChatMessage[]>([])
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const connectionStatus = ref('未连接')
  const nickname = ref(`用户-${nanoid(6)}`) // 初始时就提供一个默认昵称
  const modeSelected = ref(false)
  const isHost = ref(false)
  const hostIpForDisplay = ref('')
  const roomToken = ref('')
  const inputToken = ref('')

  let ws: WebSocket | null = null
  let serverAddress = ''

  // --- Actions ---
  //

  // 监听来自主进程的直接广播
  const listenForDirectBroadcasts = () => {
    webSocketApi.onDirectBroadcastReceived((data) => {
      loadSystemNotify({
        msg: `收到一条广播，请打开应用查看`
      })
      notification.info({
        message: `收到来自 ${data.sourceIp} 的广播`,
        description: data.text,
        placement: 'topRight',
        duration: 0
      })
    })
  }

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

        // 检查是否是广播
        if (message.broadcastType) {
          notification.info({
            message: `收到广播 - 来自: ${message.nickname}`,
            description: message.text,
            placement: 'topRight'
          })
          return // 广播消息不添加到聊天列表
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
      connectionStatus.value = '已断开'
      ws = null
      // 客户端断线后不再自动重连，让用户手动操作
      if (isHost.value) {
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
    // nickname 在加入房间时不需要重新生成，使用已有的
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

  const sendRoomBroadcast = (text: string) => {
    if (text.trim() && isHost.value) {
      const messagePayload = {
        text,
        nickname: nickname.value,
        token: 'room-broadcast' // Differentiate room broadcast
      }
      webSocketApi.sendRoomBroadcast(messagePayload)
      antMessage.success('房间广播已发送')
    }
  }

  const sendDirectBroadcast = (targets: string[], text: string) => {
    if (!text.trim()) return
    if (targets.length === 0) {
      antMessage.warn('请至少选择一个广播目标')
      return
    }

    const payload = {
      targets,
      message: {
        text,
        nickname: nickname.value
      }
    }
    webSocketApi.sendDirectBroadcast(payload)
    antMessage.success(`已向 ${targets.length} 个目标发送广播`)
  }

  const disconnect = () => {
    if (ws) {
      ws.onclose = null
      ws.close()
      ws = null
    }
    isConnected.value = false
    modeSelected.value = false
    messages.value = []
    isHost.value = false
    roomToken.value = ''
    inputToken.value = ''
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
    listenForDirectBroadcasts,
    startHosting,
    joinRoom,
    sendMessage,
    sendRoomBroadcast,
    sendDirectBroadcast,
    disconnect
  }
})
