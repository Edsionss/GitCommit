<template>
  <a-card title="定时关机" class="tool-card">
    <div class="shutdown-flex-container">
      <!-- Left: Mode Selection -->
      <div class="shutdown-left-column" v-if="!isTaskActiveInSession">
        <a-form layout="vertical">
          <a-form-item label="选择模式">
            <a-radio-group v-model:value="shutdownMode" button-style="solid" style="width: 100%">
              <a-radio-button value="timer" style="width: 50%; text-align: center"
                >计时模式</a-radio-button
              >
              <a-radio-button value="schedule" style="width: 50%; text-align: center"
                >定时模式</a-radio-button
              >
            </a-radio-group>
          </a-form-item>
        </a-form>
      </div>

      <!-- Right: Configuration / Status -->
      <div class="shutdown-right-column">
        <!-- Configuration View -->
        <div v-if="!isTaskActiveInSession">
          <a-form layout="vertical">
            <div v-if="shutdownMode === 'timer'">
              <a-form-item label="在以下时间后关机">
                <a-space>
                  <a-input-number v-model:value="timer.hours" :min="0" addon-after="小时" />
                  <a-input-number
                    v-model:value="timer.minutes"
                    :min="0"
                    :max="59"
                    addon-after="分钟"
                  />
                </a-space>
              </a-form-item>
            </div>
            <div v-if="shutdownMode === 'schedule'">
              <a-form-item label="在指定时间点关机">
                <a-date-picker
                  v-model:value="scheduleDateTime"
                  show-time
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="选择日期和时间"
                  style="width: 100%"
                />
              </a-form-item>
            </div>
          </a-form>
        </div>

        <!-- Active Task Status View -->
        <div v-else class="shutdown-status-view">
          <div class="countdown-clock">
            <div class="countdown-title">本应用启动的关机任务剩余时间</div>
            <div class="countdown-time">{{ remainingTime }}</div>
          </div>
          <div class="target-time">预计关机时间: {{ formatTimestamp(shutdownTargetTime) }}</div>
        </div>
      </div>
    </div>

    <template #actions>
      <div class="card-actions">
        <a-button type="primary" @click="handleScheduleShutdown" :loading="isShutdownLoading">
          启动或覆盖任务
        </a-button>
        <a-button danger @click="handleCancelShutdown">取消所有关机任务</a-button>
      </div>
    </template>
  </a-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSystemToolsStore } from '@/stores/systemToolsStore'
import { systemToolsApi } from '@api/systemToolsApi'
import { message } from 'ant-design-vue'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

// --- Store ---
const store = useSystemToolsStore()
const { shutdownTargetTime, remainingTime } = storeToRefs(store)

// --- Shutdown State ---
const shutdownMode = ref('timer')
const timer = ref({ hours: 0, minutes: 30 })
const scheduleDateTime = ref<Dayjs | null>(null)
const isShutdownLoading = ref(false)

// --- Computed ---
const isTaskActiveInSession = computed(() => shutdownTargetTime.value !== null)

// --- Shutdown Methods ---
const handleScheduleShutdown = async () => {
  let totalSeconds = 0
  if (shutdownMode.value === 'timer') {
    const hours = timer.value.hours || 0
    const minutes = timer.value.minutes || 0
    totalSeconds = hours * 3600 + minutes * 60
  } else {
    if (!scheduleDateTime.value) {
      message.warn('请选择一个有效的时间点。')
      return
    }
    totalSeconds = scheduleDateTime.value.diff(dayjs(), 'second')
  }

  if (totalSeconds <= 0) {
    message.warn('请输入一个将来的时间。')
    return
  }

  isShutdownLoading.value = true
  try {
    const result = await systemToolsApi.scheduleShutdown(totalSeconds)
    if (result.success) {
      const targetTimestamp = Date.now() + totalSeconds * 1000
      store.startShutdownTimer(targetTimestamp)
      message.success(result.message || '关机任务已成功设定或覆盖。')
    } else {
      message.error(result.error || '安排关机失败。')
    }
  } catch (e) {
    message.error('执行关机命令时出错。')
  } finally {
    isShutdownLoading.value = false
  }
}

const handleCancelShutdown = async () => {
  try {
    const result = await systemToolsApi.cancelShutdown()
    if (result.success) {
      store.clearShutdownTimer()
      if (result.message && result.message.includes('没有')) {
        message.info(result.message)
      } else {
        message.success(result.message || '已成功取消所有关机任务。')
      }
    } else {
      message.error(result.error || '取消关机失败。')
    }
  } catch (e) {
    message.error('执行取消命令时出错。')
  }
}

const formatTimestamp = (timestamp: number | null) => {
  if (!timestamp) return ''
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}
</script>

<style scoped>
.tool-card {
  width: 100%;
}
.shutdown-flex-container {
  display: flex;
  gap: 24px;
}
.shutdown-left-column {
  flex: 0 0 200px; /* 固定左侧宽度 */
}
.shutdown-right-column {
  flex: 1; /* 右侧占据剩余空间 */
}
.shutdown-status-view {
  text-align: center;
  padding: 16px 0;
}
.countdown-clock {
  margin: 16px 0;
}
.countdown-title {
  font-size: 14px;
  color: var(--text-secondary);
}
.countdown-time {
  font-size: 36px;
  font-weight: bold;
  color: var(--brand-primary);
  font-family: 'Courier New', Courier, monospace;
}
.target-time {
  margin-bottom: 24px;
  font-size: 14px;
}
.card-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  width: 100%;
}
</style>
