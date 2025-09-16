import { networkInterfaces } from 'os'

/**
 * 强大的通用 DOM 解析函数 (在 page.evaluate 中执行)
 * @param {object} config - 爬取配置对象
 * @param {string} config.listSelector - 包含所有目标项目的列表容器的选择器。
 * @param {object} config.fields - 一个对象，定义了需要从每个项目中提取的字段。
 * @returns {Array<object>} - 返回一个包含所有提取数据的对象数组。
 */
export const scrapingLogic = (config) => {
  // --- Helper Function: 用于解析单个字段的配置 ---
  const extractField = (element, fieldConfig) => {
    // 1. 标准化配置（处理字符串简写形式）
    if (typeof fieldConfig === 'string') {
      fieldConfig = { selector: fieldConfig, type: 'text' }
    }

    // 2. 处理 multiple: true 的情况，获取元素数组
    if (fieldConfig.multiple) {
      const elements = Array.from(element.querySelectorAll(fieldConfig.selector))
      return elements.map((el) => extractSingleData(el, fieldConfig.type || 'text'))
    }

    // 3. 获取单个元素
    const targetElement = element.querySelector(fieldConfig.selector)
    if (!targetElement) {
      return null // 如果找不到元素，返回 null
    }

    // 4. 提取数据
    return extractSingleData(targetElement, fieldConfig.type || 'text')
  }

  // --- Helper Function: 从单个元素中根据类型提取数据 ---
  const extractSingleData = (el, type) => {
    let data
    switch (type) {
      case 'text':
        data = el.innerText
        break
      case 'html':
        data = el.innerHTML
        break
      // 自动处理 'href', 'src' 等属性，并返回绝对路径
      case 'href':
        data = el.href // el.href 会自动转换为绝对 URL
        break
      case 'src':
        data = el.src // el.src 也会自动转换为绝对 URL
        break
      default:
        // 其他所有字符串都被视为普通属性
        data = el.getAttribute(type)
        break
    }
    // 对提取的文本进行清理，去除首尾多余的空白和换行符
    return typeof data === 'string' ? data.trim() : data
  }

  // --- 主逻辑 ---
  const results = []
  // 1. 找到所有的列表项
  const listItems = document.querySelectorAll(config.listSelector)

  // 2. 遍历每个列表项
  listItems.forEach((item) => {
    const itemData = {}
    // 3. 遍历定义的每个字段，并从当前项中提取数据
    for (const key in config.fields) {
      const fieldConfig = config.fields[key]
      itemData[key] = extractField(item, fieldConfig)
    }
    results.push(itemData as never)
  })

  return results
}

export function getLocalIpAddress(): string | null {
  const nets = networkInterfaces()
  const results: string[] = []

  for (const name of Object.keys(nets)) {
    const netInfo = nets[name]
    if (netInfo) {
      for (const net of netInfo) {
        // --- 核心过滤逻辑 ---
        // 1. 只关心 IPv4
        // 2. 排除环回地址 (127.0.0.1)
        // 3. 必须是私有地址 (192.168.x.x, 10.x.x.x, or 172.16.x.x - 172.31.x.x)
        if (net.family === 'IPv4' && !net.internal) {
          // 私有 IP 地址段正则表达式
          const isPrivateIP = /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(net.address)

          if (isPrivateIP) {
            results.push(net.address)
          }
        }
      }
    }
  }

  // 如果找到了多个符合条件的私有IP，优先返回 192.168.x.x 的
  const preferredIp = results.find((ip) => ip.startsWith('192.168.'))
  if (preferredIp) {
    return preferredIp
  }

  // 否则，返回找到的第一个符合条件的私有IP
  return results.length > 0 ? results[0] : null
}
