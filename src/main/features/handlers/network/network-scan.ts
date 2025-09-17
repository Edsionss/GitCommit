import { ipcMain } from 'electron'
import { networkInterfaces } from 'os'
import http from 'http'

// Function to find CognitoOcean hosts on the local network
async function findAppHosts(port: number): Promise<string[]> {
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

// Register IPC handler for network scan
export function registerNetworkScanHandlers() {
  ipcMain.handle('network:scan', async (_event, port: number) => {
    try {
      const ips = await findAppHosts(port)
      return { success: true, ips }
    } catch (error) {
      console.error('Failed to scan network:', error)
      return { success: false, error: (error as Error).message }
    }
  })
}