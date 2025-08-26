// src/main/services/StoreService.ts

import __Store from 'electron-store'
const Store = __Store.default || __Store
import { defaultData, type AppStore } from '@sharedType/store'
// 为你的存储数据定义一个类型接口，以获得完整的类型提示
// 这非常重要，能避免很多低级错误

export class StoreService {
  private store: Store<AppStore>

  constructor() {
    // 初始化 electron-store，并传入类型和默认值
    this.store = new Store<AppStore>({
      defaults: defaultData
    })
  }

  /**
   * [查] 获取一个值
   * @param key 键
   * @returns 对应的值
   */
  get<K extends keyof AppStore>(key: K): AppStore[K] {
    return this.store.get(key)
  }

  /**
   * [增/改] 设置一个值
   * @param key 键
   * @param value 值
   */
  set<K extends keyof AppStore>(key: K, value: AppStore[K]): void {
    this.store.set(key, value)
  }

  /**
   * [删] 删除一个键及其值
   * @param key 键
   */
  delete(key: keyof AppStore): void {
    this.store.delete(key)
  }

  /**
   * [清空] 清除所有存储
   */
  clear(): void {
    this.store.clear()
  }
}

// 导出一个单例，确保整个应用中只有一个 StoreService 实例
const storeService = new StoreService()
export default storeService
