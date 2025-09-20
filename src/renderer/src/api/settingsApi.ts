
const { api } = window

export const settingsApi = {
  getAutoStartStatus: (): Promise<boolean> => api.getAutoStartStatus(),

  setAutoStart: (isEnabled: boolean): Promise<{ success: boolean; error?: string }> =>
    api.setAutoStart(isEnabled)
}
