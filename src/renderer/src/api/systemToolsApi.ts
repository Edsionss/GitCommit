
const { api } = window

export const systemToolsApi = {
  scheduleShutdown: (seconds: number) => api.scheduleShutdown(seconds),

  cancelShutdown: () => api.cancelShutdown(),

  getEnvVar: (key: string) => api.getEnvVar(key),

  setEnvVar: (key: string, value: string) => api.setEnvVar(key, value)
}
