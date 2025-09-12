<template>
  <a-timeline>
    <a-timeline-item :color="getColor(item?.type)" v-for="(item, index) in data" :key="index">
      <template #dot>
        <NotificationOutlined />
      </template>
      <p>{{ item?.content }}</p>
    </a-timeline-item>
  </a-timeline>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { NotificationOutlined } from '@ant-design/icons-vue'
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const getColor = (type: string) => {
  return type == 'important' ? '#FF6600' : '#00CCFF'
}
</script>

<style scoped></style>
