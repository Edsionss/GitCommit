import { registerStoreHandlers } from '@handlers/store_conf'
import { registerGitInfoHandlers } from './git/git-info'
import { registerGitScanHandlers } from './git/git-scan'
import { registerGitUtilsHandlers } from './git/git-utils'
import { registerFileSystemHandlers } from './fileSystem/file-system'
import { registerHistoryHandlers } from './history/history'
import { registerAiHandlers } from '@handlers/ai/ai'
import { initializeWebSocket } from '@handlers/websocket'
export function registerIpcHandlers() {
  // Register handlers from other modules
  registerGitInfoHandlers()
  registerGitScanHandlers()
  registerGitUtilsHandlers()
  registerFileSystemHandlers()
  registerHistoryHandlers()
  registerAiHandlers()
  registerStoreHandlers()
  initializeWebSocket()
  // 注册 IPC 处理器
}
