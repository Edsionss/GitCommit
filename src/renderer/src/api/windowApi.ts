export const minimizeWindow = (): Promise<void> => window.api.minimizeWindow()
export const maximizeWindow = (): Promise<void> => window.api.maximizeWindow()
export const closeWindow = (): Promise<void> => window.api.closeWindow()
export const onWindowStateChange = (
  callback: (state: 'maximized' | 'unmaximized') => void
): (() => void) => window.api.onWindowStateChange(callback)
export const onAppMetricsUpdate = (callback: (metrics: { cpu: number; memory: number }) => void) =>
  window.api.onAppMetricsUpdate(callback)
