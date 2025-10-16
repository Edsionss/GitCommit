// 定义设置对象的类型
export type ThemeMode = 'light' | 'dark' | 'system'
export interface DisplayConfig {
  theme: ThemeMode
  sidebarPosition: 'left' | 'right'
  zoom: number
  animations: boolean
}

export interface Preferences {
  language: string
  dateFormat: string
  timeFormat: '12' | '24'
}

export interface GitConfig {
  defaultAuthor: string
  defaultEmail: string
  repositoryPath: string
  refreshInterval: string
  clearScanConfigOnFinish: boolean
}

export interface SystemConfig {
  startWithSystem: boolean
  notifications: boolean
  autoUpdate: boolean
  telemetry: boolean
  launch: string
}

import type { AiConfig } from '@sharedType/ai'

export interface AppSettings {
  AiConfig: AiConfig
  GitConfig: GitConfig
  DisplayConfig: DisplayConfig
  Preferences: Preferences
  SystemConfig: SystemConfig
}
