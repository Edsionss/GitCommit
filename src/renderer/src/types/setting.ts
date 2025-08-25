// 定义设置对象的类型
export type ThemeMode = 'light' | 'dark' | 'system'
export interface DisplayConfig {
  theme: ThemeMode
  sidebarPosition: 'left' | 'right'
  zoom: string
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
}

export interface AiConfig {
  provider: string | null
  apiKey: string
  endpoint: string
  model: string
  enableAiHistory: boolean
  enableAutoSave: boolean
  enableStreaming: boolean
}

export interface AppSettings {
  DisplayConfig: DisplayConfig
  Preferences: Preferences
  GitConfig: GitConfig
  SystemConfig: SystemConfig
  AiConfig: AiConfig
}
