<template>
  <div class="timeline-container">
    <a-timeline>
      <a-timeline-item
        :color="getColor(item.isImportant)"
        v-for="(item, index) in data"
        :key="index"
      >
        <template #dot>
          <NotificationOutlined />
        </template>
        <div class="timeline-content" :style="'color:' + getColor(item.isImportant)">
          <div class="content" :class="{ important: item.isImportant ? true : false }">
            <a-tag :bordered="false" color="gold">{{ item.newsDate }}</a-tag>
            <a-tag :bordered="false" color="gold">{{ item.newsTime }}</a-tag>
            {{ item.title }}
            {{ item.content }}
          </div>
        </div>
      </a-timeline-item>
    </a-timeline>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { NotificationOutlined } from '@ant-design/icons-vue'
import type { StockNews, StockNewsQueryOptions } from '@sharedType/stockNews'

const props = defineProps<{
  data: StockNews[]
}>()

const getColor = (isImportant: number) => {
  return isImportant ? 'var(--color-danger)' : 'var(--text-primary)'
  // '#00CCFF'
}
</script>

<style scoped lang="scss">
.timeline-container {
  height: 100%;
  overflow: auto;
  width: 100%;
  .timeline-content {
    font-size: 15px;
    padding: 10px;
    // background-color: #f5f5f5;
    border-bottom: 1px solid var(--border-secondary);
    // border-radius: 0.5rem;
    .content {
      &.important {
        font-weight: 700 !important;
      }
    }
  }
}
</style>
