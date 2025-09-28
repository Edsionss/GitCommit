export const windowApi = {
  minimizeWindow: (): Promise<void> => window.api.minimizeWindow(),
  maximizeWindow: (): Promise<void> => window.api.maximizeWindow(),
  closeWindow: (): Promise<void> => window.api.closeWindow(),
  onWindowStateChange: (callback: (state: 'maximized' | 'unmaximized') => void): (() => void) =>
    window.api.onWindowStateChange(callback)
}
