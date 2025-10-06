import { networkInterfaces } from 'os'
import { Notification } from 'electron'
import { flashMainWindow, getMainWindow } from '@main/index'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn' // 导入中文语言包
import fs from 'fs'
import path from 'path'

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

/**
 * 将下划线式字符串转换为驼峰式。
 * @example 'hello_world' -> 'helloWorld'
 */
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
}

/**
 * 将驼峰式字符串转换为下划线式。
 * @example 'helloWorld' -> 'hello_world'
 */
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

/**
 * 递归地转换对象或数组中所有键的命名风格。
 * @param input - 要转换的对象或数组。
 * @param mode - 'camel' 表示转为驼峰式, 'snake' 表示转为下划线式。
 * @returns 转换后的新对象或数组。
 */
export function autoTransformKeys<T>(input: T, mode: 'camel' | 'snake'): T {
  // 基本类型或 null 直接返回
  if (input === null || typeof input !== 'object') {
    return input
  }

  // 递归处理数组
  if (Array.isArray(input)) {
    return input.map((item) => autoTransformKeys(item, mode)) as unknown as T
  }

  // 递归处理对象
  const transformer = mode === 'camel' ? toCamelCase : toSnakeCase
  return Object.fromEntries(
    Object.entries(input as Record<string, any>).map(([key, value]) => {
      const newKey = transformer(key)
      // 对值也进行递归转换，以处理嵌套对象
      const newValue = autoTransformKeys(value, mode)
      return [newKey, newValue]
    })
  ) as T
}

export const loadSystemNotify = (
  msg: string = `收到一条广播，请打开应用查看`,
  title: string = 'New Notify'
) => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: title,
      body: msg,
      icon: '/path/to/icon.png' // 可选：添加图标
    })
    flashMainWindow()
    notification.on('click', () => {
      const mainWindow = getMainWindow() // 假设这是你获取主窗口的函数
      if (mainWindow) {
        if (mainWindow.isMinimized()) {
          mainWindow.restore() // 如果最小化了，就恢复
        }
        mainWindow.focus() // 聚焦窗口
      }
    })

    notification.show()
  }
}

/**
 * 描述单列表格数据的结构（用于文档说明）
 * @typedef {object} TableColumnData
 * @property {string} title - 表格该列的表头标题 (来自于 <th>)
 * @property {string[]} value - 一个包含该列所有行数据的数组 (来自于 <td>)
 */

/**
 * 从一个 HTML <table> 元素中按列提取数据。
 *
 * @param {HTMLTableElement} tableElement - 你想要爬取数据的 HTMLTableElement 对象。
 * @returns {TableColumnData[]} 一个数组，每个元素代表一列数据。
 *          格式为 { title: string, value: string[] }。
 *          如果表格没有表头 (thead > tr > th)，则返回一个空数组。
 *
 * @example
 * const myTable = document.getElementById('my-data-table');
 * if (myTable) {
 *   const tableData = extractTableDataByColumn(myTable);
 *   console.log(tableData);
 * }
 *
 * @note
 * - 此函数假设表格结构标准，即表头在 `<thead>` 中，数据在 `<tbody>` 中。
 * - 不支持复杂的表格结构，如 `colspan` 或 `rowspan`。
 * - 提取的内容是元素的 `textContent`，并进行了 `.trim()` 处理。
 */
export function extractTableDataByColumn(tableElement: HTMLTableElement) {
  // 1. 获取表头 <th> 元素
  const headerCells = tableElement.querySelectorAll('thead tr th')

  if (headerCells.length === 0) {
    console.warn('未在 <thead> 中找到任何表头 <th> 元素，无法提取数据。')
    return []
  }

  // 2. 初始化结果数组
  const columns = Array.from(headerCells).map((header) => ({
    title: header?.textContent?.trim() ?? '',
    value: [] as string[] // <-- 初始化为数组
  }))

  // 3. 获取所有数据行
  const dataRows = tableElement.querySelectorAll('tbody tr')

  // 4. 遍历每一行，把数据 push 进去
  dataRows.forEach((row) => {
    const cells = row.querySelectorAll('td')
    cells.forEach((cell, cellIndex) => {
      if (cellIndex < columns.length) {
        columns[cellIndex].value.push(cell.textContent?.trim() ?? '')
      }
    })
  })

  // 5. 最后统一转成字符串（如果你一定要 JSON）
  columns.forEach((col) => {
    // @ts-ignore
    col.value = JSON.stringify(col.value)
  })

  return columns
}

type ColumnData = {
  title: string
  value: string // JSON 字符串
}

export function mergeColumnArrayList(list: ColumnData[][]): ColumnData[] {
  const map = new Map<string, string[]>()

  list.forEach((arr) => {
    arr.forEach((col) => {
      const values = JSON.parse(col.value) as string[]
      if (!map.has(col.title)) {
        map.set(col.title, [])
      }
      map.get(col.title)!.push(...values)
    })
  })

  return Array.from(map.entries()).map(([title, values]) => ({
    title,
    value: JSON.stringify(values)
  }))
}

export function getYesterdayCN() {
  return dayjs().subtract(1, 'day').locale('zh-cn').format('YYYY.MM.DD dddd')
}

export function isTimeAfter(t1, t2) {
  const toSeconds = (t) => {
    const [h, m, s] = t.split(':').map(Number)
    return h * 3600 + m * 60 + s
  }
  return toSeconds(t1) > toSeconds(t2)
}

/**
 * 将数据写入指定目录下的新文件
 * - 支持相对/绝对路径
 * - 自动创建目录
 * - 自动序列化对象
 * - 支持写入文本或 Buffer
 */
export function writeResultFile(
  targetDir: string,
  data: unknown,
  fileName?: string,
  ext: string = 'js'
): string {
  // 1️⃣ 确保是绝对路径
  const absDir = path.isAbsolute(targetDir) ? targetDir : path.join(process.cwd(), targetDir)

  // 2️⃣ 确保目录存在
  if (!fs.existsSync(absDir)) {
    fs.mkdirSync(absDir, { recursive: true })
  }

  // 3️⃣ 生成文件名
  const timestamp = Date.now()
  const safeFileName = fileName || timestamp.toString()
  const filePath = path.join(absDir, `${safeFileName}.${ext}`)

  // 4️⃣ 处理数据类型
  let content: string | Buffer

  if (typeof data === 'string') {
    content = data
  } else if (Buffer.isBuffer(data)) {
    content = data
  } else {
    // 对象、数组等情况，序列化为 JS 文件
    content = `export default ${JSON.stringify(data, null, 2)}`
  }

  // 5️⃣ 写入文件
  if (typeof content === 'string') {
    fs.writeFileSync(filePath, content, 'utf-8')
  } else {
    fs.writeFileSync(filePath, content)
  }

  console.log(`✅ 文件已写入: ${filePath}`)
  return filePath
}
