### **方案：Puppeteer 在混合模式下的动态配置方案**

此方案旨在解决在 Electron 应用模式和纯 Node.js 服务模式下，如何统一且高效地使用 Puppeteer 的问题。

#### **1. 问题分析：为什么需要特殊配置？**

1.  **应用模式 (App Mode)**:
    *   代码运行在 Electron 主进程中，可以利用 `puppeteer-core` 连接到 Electron 自带的 Chromium 浏览器，实现功能且包体积小。

2.  **服务模式 (Server Mode)**:
    *   代码作为纯 Node.js 进程运行，环境中没有现成的浏览器可供 `puppeteer-core` 连接，因此直接运行会失败。

#### **2. 核心思路：动态配置 + 按需依赖**

- **开发时**，使用完整版 `puppeteer` 包（作为开发依赖），它会自动下载一个匹配的 Chromium 浏览器，供服务模式在本地开发时使用。
- **生产部署时**，不打包浏览器，而是依赖服务器上预先安装好的 Chrome/Chromium，通过环境变量指定其路径。

---


### **3. 实施方案**

**步骤 1: 安装 `puppeteer` 作为开发依赖**

将完整版的 `puppeteer` 包只作为**开发依赖**安装。它只在开发环境存在，不会被打包到生产构建中。

```bash
pnpm add -D puppeteer
```

**步骤 2: 创建动态的 Puppeteer 配置**

在 `src/main/utils/` 目录下创建一个新文件 `puppeteer-config.ts`，用于根据环境生成不同的启动配置。

```typescript
// src/main/utils/puppeteer-config.ts

import { executablePath } from 'puppeteer' // 从完整版 puppeteer 导入
import { LaunchOptions } from 'puppeteer-core'

/**
 * 根据当前运行环境动态获取 Puppeteer 的启动选项
 */
export function getPuppeteerLaunchOptions(): LaunchOptions {
  const isDev = process.env.NODE_ENV === 'development'
  const startMode = process.env.VITE_START_MODE || 'app'

  console.log(`[Puppeteer] Configuring for: mode=${startMode}, isDev=${isDev}`)

  // 1. 应用模式 (App Mode)
  // 无论开发还是生产，都使用 Electron 自带的浏览器
  if (startMode === 'app') {
    console.log('[Puppeteer] Using Electron\'s built-in browser.')
    return {
      executablePath: process.execPath, // process.execPath 指向 Electron 的可执行文件
      headless: false, // 在应用模式下通常需要看到界面
      args: ['--no-sandbox']
    }
  }

  // 2. 服务模式 (Server Mode)
  if (startMode === 'server') {
    // 2.1 开发环境
    if (isDev) {
      console.log('[Puppeteer] Using puppeteer\'s downloaded browser for development.')
      return {
        executablePath: executablePath(), // 使用 `puppeteer` 包下载的浏览器
        headless: true
      }
    }
    
    // 2.2 生产环境
    console.log('[Puppeteer] Using system-provided browser for production server.')
    const chromiumPath = process.env.CHROMIUM_PATH
    if (!chromiumPath) {
      throw new Error(
        'CHROMIUM_PATH environment variable is not set for production server mode.'
      )
    }
    return {
      executablePath: chromiumPath, // 使用服务器上安装的浏览器
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  }

  // 默认或错误情况
  throw new Error(`Unsupported startup configuration for Puppeteer: ${startMode}`)
}
```

**步骤 3: 在 Puppeteer 服务中使用此配置**

修改现有调用 `puppeteer.launch` 的地方，使用新建的动态配置函数。

```typescript
// 示例: src/main/features/services/puppeteer/index.ts

import puppeteer from 'puppeteer-core'
import { getPuppeteerLaunchOptions } from '@nodeUtils/puppeteer-config' // 导入配置函数

export class PuppeteerService {
  async startScraping(url: string) {
    // 获取动态配置
    const launchOptions = getPuppeteerLaunchOptions()

    // 使用该配置启动 Puppeteer
    const browser = await puppeteer.launch(launchOptions)
    
    const page = await browser.newPage()
    await page.goto(url)
    
    // ... 抓取逻辑 ...

    await browser.close()
  }
}
```

---


### **4. 补充问答：关于 Linux 服务器环境**

**问：Linux 服务器环境有浏览器吗？**

**答：** 这是一个非常好的问题。默认情况下，绝大多数 Linux 服务器环境 **没有** 安装图形界面浏览器。

*   **原因**: 服务器发行版（如 Ubuntu Server, CentOS）遵循最小化原则，只安装核心服务组件，以提高性能和安全性。它们通常在“无头 (Headless)”模式下运行，只有命令行，没有图形界面。

**问：那如何在服务器上运行 Puppeteer？**

**答：** 完全可行，并且是标准做法。您只需通过包管理器安装一个无头版本的浏览器即可，无需安装完整的桌面环境。

例如，在基于 Debian/Ubuntu 的服务器上，运行以下命令：

```bash
# 更新包列表
sudo apt-get update

# 安装 Chromium 浏览器及其依赖
sudo apt-get install -y chromium-browser
```

Puppeteer 会在后台以无头模式调用这个程序，不需要任何可见窗口。

**问：如何与我们的方案结合？**

**答：** 这正是本方案设计的目的。

1.  **在服务器上**: 执行一次 `sudo apt-get install -y chromium-browser`。
2.  **找到路径**: 通常安装在 `/usr/bin/chromium-browser`。
3.  **启动应用**: 在服务器上启动应用时，通过环境变量将路径传递给它：

    ```bash
    CHROMIUM_PATH=/usr/bin/chromium-browser pnpm start:server
    ```
    *(这里的 `pnpm start:server` 是一个假设的生产启动脚本)*

这样，您的应用就能在生产服务器上找到并使用预装的浏览器，完美解决了开发便利性、生产性能和部署包大小的问题。
