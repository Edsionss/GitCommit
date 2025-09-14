export interface AppStore {
  windowBounds: {
    width: number
    height: number
    x?: number
    y?: number
  }
  userPreferences: {
    theme: 'light' | 'dark'
    launchAtLogin: boolean
  }
  lastLoginUser?: string
}

export const defaultData: AppStore = {
  windowBounds: {
    width: 1024,
    height: 768
  },
  userPreferences: {
    theme: 'light',
    launchAtLogin: false
  }
}
