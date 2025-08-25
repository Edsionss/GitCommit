import { ref, watch, readonly } from 'vue'
import dayjs from 'dayjs'
import { useSettingsStore } from '@/stores/settingsStore'
import { storeToRefs } from 'pinia'

// 默认格式
const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD'
const DEFAULT_TIME_FORMAT = '24' // '24' or '12'

/**
 * useFormatters
 *
 * 一个用于全局日期时间格式化的 hooks：
 * - 从 store 的用户偏好中读取日期/时间格式
 * - 当 store 中的设置变化时自动同步
 * - 提供格式化函数 formatDate
 */
export function useFormatters() {
  const settingsStore = useSettingsStore()
  const { Preferences } = storeToRefs(settingsStore)

  // 响应式存储当前的格式配置
  const dateFormat = ref(DEFAULT_DATE_FORMAT)
  const timeFormat = ref(DEFAULT_TIME_FORMAT)

  /**
   * 根据 store 更新本地格式
   */
  const syncFormats = () => {
    if (Preferences.value) {
      dateFormat.value = Preferences.value.dateFormat || DEFAULT_DATE_FORMAT
      timeFormat.value = Preferences.value.timeFormat || DEFAULT_TIME_FORMAT
    }
  }

  // 监听 store 中偏好设置的变化，自动同步
  watch(
    () => Preferences.value,
    () => syncFormats(),
    { deep: true, immediate: true }
  )

  /**
   * 格式化日期时间
   * @param date 输入的日期（Date 或字符串）
   * @returns 格式化后的字符串
   */
  const formatDate = (date: string | Date | undefined | null): string => {
    if (!date) return ''

    // 时间部分：根据 12 小时制还是 24 小时制来决定
    const timeFmt = timeFormat.value === '12' ? 'hh:mm:ss A' : 'HH:mm:ss'
    const fullFormat = `${dateFormat.value} ${timeFmt}`

    return dayjs(date).format(fullFormat)
  }

  return {
    formatDate, // 提供格式化函数
    dateFormat: readonly(dateFormat), // 只读暴露，防止外部修改
    timeFormat: readonly(timeFormat)
  }
}
