import { dbHelper } from '@features/database'
import type { RouteRecord, RouteRecordWithOptionalId } from '@shared/types/dtos/MenuManagement'
import { nanoid } from 'nanoid' // 使用 uuid 生成唯一ID
import { autoTransformKeys } from '@nodeUtils/index'
// 将从数据库取出的记录（meta是字符串）转换为前端需要的格式（meta是对象）
function formatMenuRecord(record: any): RouteRecord {
  return {
    ...record,
    meta: JSON.parse(record.meta || '{}')
  }
}

// 将要存入数据库的记录（meta是对象）转换为数据库存储的格式（meta是字符串）
function prepareRecordForDb(record: Partial<RouteRecord>): any {
  const dbRecord = { ...record }
  if (dbRecord.meta) {
    dbRecord.meta = JSON.stringify(dbRecord.meta) as any
  }
  // 删除 children 属性，因为它不存在于数据库表中
  if (dbRecord.children) {
    delete dbRecord.children
  }
  return dbRecord
}

export class RoutesMenuService {
  private static readonly TABLE_NAME = 'routes_menu'

  /**
   * 获取所有菜单项，并以树形结构返回
   * @returns {Promise<RouteRecord[]>}
   */
  public async getAllMenus(): Promise<RouteRecord[]> {
    try {
      const flatMenus = await dbHelper.find<any>(RoutesMenuService.TABLE_NAME, {}, '*')
      const formattedMenus = flatMenus.map(formatMenuRecord)
      // 按 menu_order 排序
      formattedMenus.sort((a, b) => a.menuOrder - b.menuOrder)
      return autoTransformKeys(formattedMenus, 'camel')
    } catch (error) {
      console.error('Error fetching all menus:', error)
      return []
    }
  }

  /**
   * 添加一个新菜单
   * @param {RouteRecord} menu - 要添加的菜单数据
   * @returns {Promise<RunResult>}
   */
  public async addMenu(menu: Omit<RouteRecord, 'id'>) {
    try {
      const dbRecord = prepareRecordForDb({ ...menu, id: nanoid() })
      return await dbHelper.insert(
        RoutesMenuService.TABLE_NAME,
        autoTransformKeys(dbRecord, 'snake')
      )
    } catch (error) {
      console.error('Error adding menu:', error)
      throw error
    }
  }

  /**
   * 批量添加菜单
   * @param {RouteRecordWithOptionalId[]} menus - 要添加的菜单数据数组
   * @returns {Promise<RunResult[]>}
   */
  public async addMenus(menus: RouteRecordWithOptionalId[]) {
    try {
      const dbRecords = menus.map((menu) =>
        prepareRecordForDb({ ...menu, id: menu.id || nanoid() })
      )

      // 使用批量插入 + 事务
      return await Promise.resolve(
        dbHelper.insertMany(RoutesMenuService.TABLE_NAME, autoTransformKeys(dbRecords, 'snake'))
      )
    } catch (error) {
      console.error('Error adding menus:', error)
      throw error
    }
  }

  /**
   * 更新一个现有菜单
   * @param {RouteRecord} menu - 要更新的菜单数据
   * @returns {Promise<{ changes: number }>}
   */
  public async updateMenu(menu: Partial<RouteRecord>) {
    if (!menu.id) {
      throw new Error('Update operation must have a menu ID.')
    }
    try {
      const { id, ...dataToUpdate } = menu
      const dbRecord = prepareRecordForDb(dataToUpdate)
      return await dbHelper.update(
        RoutesMenuService.TABLE_NAME,
        autoTransformKeys(dbRecord, 'snake'),
        { id }
      )
    } catch (error) {
      console.error('Error updating menu:', error)
      throw error
    }
  }

  /**
   * 删除一个菜单
   * @param {string} id - 要删除的菜单ID
   * @returns {Promise<{ changes: number }>}
   */
  public async deleteMenu(id: string) {
    try {
      return await dbHelper.delete(RoutesMenuService.TABLE_NAME, { id })
    } catch (error) {
      console.error('Error deleting menu:', error)
      throw error
    }
  }

  /**
   * 删除一个菜单
   * @returns {Promise<{ changes: number }>}
   */
  public async cleanMenu() {
    try {
      return await dbHelper.clearTable(RoutesMenuService.TABLE_NAME)
    } catch (error) {
      console.error('Error clean menu:', error)
      throw error
    }
  }
}

export const routesMenuService = new RoutesMenuService()
