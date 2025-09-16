// src/main/services/StoreService.ts
import { Conf } from 'electron-conf/main' // ← 正确的导入方式（main 进程用）

export class StoreService {
  // 使用泛型记录类型，保持和 electron-conf API 匹配
  private store: Conf<Record<string, any>>

  constructor() {
    // 与 electron-store 行为一致：同步 API，直接构造
    this.store = new Conf<Record<string, any>>()
  }

  /** [查] 获取一个值 */
  get(key: string): any {
    return this.store.get(key as any)
  }

  /** [增/改] 设置一个值 */
  set(key: string | Record<string, any>, value?: any): void {
    // 支持 set(object) 和 set(key, value)
    if (typeof key === 'object') {
      this.store.set(key)
    } else {
      this.store.set(key, value)
    }
  }

  /** [删] 删除一个键及其值 */
  delete(key: string): void {
    this.store.delete(key)
  }

  /** [清空] 清除所有存储 */
  clear(): void {
    this.store.clear()
  }
}

// 单例导出，保持用法不变
const storeService = new StoreService()
export default storeService
