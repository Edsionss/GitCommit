import type { RouteRecord } from '@sharedType/MenuManagement'

const { api } = window

export const routesMenuApi = {
  getAll: (): Promise<RouteRecord[]> => api.getAllMenus(),

  add: (menu: Omit<RouteRecord, 'id'>): Promise<any> => api.addMenu(menu),

  addMany: (menus: Omit<RouteRecord, 'id'>[]): Promise<any> => api.addMenus(menus),

  update: (menu: Partial<RouteRecord>): Promise<any> => api.updateMenu(menu),

  delete: (id: string): Promise<any> => api.deleteMenu(id)
}
