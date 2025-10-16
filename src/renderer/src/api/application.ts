// src/renderer/src/api/application.ts

/**
 * 窗口最小化
 */
export const minimizeWindow = (): void => {
  window.api.minimizeWindow()
}

/**
 * 窗口最大化/取消最大化
 */
export const maximizeWindow = (): void => {
  window.api.maximizeWindow()
}

/**
 * 关闭窗口
 */
export const closeWindow = (): void => {
  window.api.closeWindow()
}

/**
 * 监听窗口状态变化
 * @param callback 回调函数，接收 'maximized' 或 'unmaximized'
 * @returns unlisten 函数，用于取消监听
 */
export const onWindowStateChange = (
  callback: (state: 'maximized' | 'unmaximized') => void
): (() => void) => {
  return window.api.onWindowStateChange(callback)
}

/**
 * 获取项目依赖
 */
export const getDependencies = (): Promise<{
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
}> => {
  return window.api.getDependencies()
}

export const resetDatabase = () => {
  return window.api.resetDatabase()
}

// 将所有函数组合到一个名为 applicationApi 的对象中
export const applicationApi = {
  minimizeWindow,
  maximizeWindow,
  closeWindow,
  onWindowStateChange,
  getDependencies,
  resetDatabase
}
