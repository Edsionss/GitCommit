
import { app } from 'electron'
import storeService from '@features/services/store_conf'

const AUTO_START_STORE_KEY = 'settings.autoStart'

export class SettingsService {
  /**
   * 获取应用的开机自启状态。
   * @returns {boolean} 如果设置为开机自启，则返回 true。
   */
  public getAutoStartStatus(): boolean {
    const settings = app.getLoginItemSettings()
    return settings.openAtLogin
  }

  /**
   * 设置应用的开机自启状态。
   * @param {boolean} isEnabled - 是否开启开机自启。
   */
  public setAutoStart(isEnabled: boolean): void {
    // 调用 Electron API 设置
    app.setLoginItemSettings({
      openAtLogin: isEnabled,
      path: app.getPath('exe')
    })
    // 持久化存储该状态，以便应用启动时检查
    storeService.set(AUTO_START_STORE_KEY, isEnabled)
  }

  /**
   * 从持久化存储中获取设置值。
   * @returns {boolean}
   */
  public getStoredAutoStartSetting(): boolean {
    return storeService.get(AUTO_START_STORE_KEY) || false
  }
}

export const settingsService = new SettingsService()
