import { defineStore } from 'pinia'
import { ref, nextTick } from 'vue'
import type { ChatMessage } from '@sharedType/WebSocket'
import { webSocketApi } from '@api/webSocket'
import { message as antMessage, notification } from 'ant-design-vue'
import { nanoid } from 'nanoid'

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
  const scannedIps = ref<string[]>([])
  const isScanning = ref(false)
  const selectedIpsForBroadcast = ref<string[]>([])

  const setSelectedIpsForBroadcast = (ips: string[]) => {
    selectedIpsForBroadcast.value = ips
  }

  let ws: WebSocket | null = null
  let serverAddress = ''

  // --- Actions ---

  const scanNetwork = async () => {
    isScanning.value = true
    scannedIps.value = []
    antMessage.info('正在扫描局域网中的主机...')
    try {
      const result = await webSocketApi.scan(8888) // Assuming port 8888
      if (result.success && result.ips && result.ips.length > 0) {
        scannedIps.value = result.ips
        antMessage.success(`扫描完成！发现 ${result.ips.length} 个主机。`)
      } else {
        antMessage.warn('扫描完成，未发现任何主机。')
      }
    } catch (error) {
      antMessage.error(`扫描时发生错误: ${(error as Error).message}`)
    } finally {
      isScanning.value = false
    }
  }

  // 监听来自主进程的直接广播
  const listenForDirectBroadcasts = () => {
    webSocketApi.onDirectBroadcastReceived((data) => {
      notification.info({
        message: `收到来自 ${data.sourceIp} 的广播`,
        description: data.text,
        placement: 'topRight',
        duration: 2000 // Do not automatically close
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

      // Add a system message for joining
      messages.value.push({
        id: nanoid(),
        text: '您已成功加入房间。欢迎开始聊天！',
        sender: 'system',
        nickname: '系统消息',
        timestamp: Date.now(),
        isSystemMessage: true
      })
    }

    ws.onmessage = (event) => {
      try {
        const message: ChatMessage = JSON.parse(event.data)

        // 检查是否是房间内的全局广播
        if (message.isGlobal) {
          notification.info({
            message: `房间广播 - 来自: ${message.nickname}`,
            description: message.text,
            placement: 'topRight',
            duration: 0 // Do not automatically close
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

  const sendGlobalBroadcast = (text: string) => {
    if (!text.trim()) return

    const targets =
      selectedIpsForBroadcast.value.length > 0 ? selectedIpsForBroadcast.value : scannedIps.value

    console.log('Broadcast Targets:', targets) // Added for debugging

    if (targets.length === 0) {
      antMessage.warn('没有发现任何可广播的主机，请先扫描网络。')
      return
    }

    // Exclude self from broadcast if user is a host and no specific targets are selected
    const finalTargets =
      isHost.value && selectedIpsForBroadcast.value.length === 0
        ? targets.filter((ip) => ip !== hostIpForDisplay.value)
        : targets

    if (finalTargets.length === 0) {
      antMessage.info('网络中只有您一个主机，无需广播。')
      return
    }

    const payload = {
      targets: [...finalTargets], // Fix clone error by creating a plain array
      message: {
        text,
        nickname: nickname.value
      }
    }
    webSocketApi.sendDirectBroadcast(payload)
    antMessage.success(`已向 ${finalTargets.length} 个目标发送全局广播`)
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
    scannedIps,
    isScanning,
    scanNetwork,
    listenForDirectBroadcasts,
    startHosting,
    joinRoom,
    sendMessage,
    sendGlobalBroadcast,
    setSelectedIpsForBroadcast,
    disconnect
  }
})
