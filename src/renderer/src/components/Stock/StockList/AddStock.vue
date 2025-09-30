<template>
  <a-modal title="添加自选股票" :open="visible" @cancel="handleCancel" @ok="handleOk">
    <a-input-search
      v-model:value="searchQuery"
      placeholder="输入股票名称或代码"
      enter-button="搜索"
      @search="onSearch"
      :loading="searching"
    />
    <a-list class="search-results" :data-source="searchResults" v-if="searchResults.length > 0">
      <template #renderItem="{ item }">
        <a-list-item
          @click="selectStock(item)"
          :class="{ active: item.code === selectedStock?.code }"
        >
          {{ item.name }} ({{ item.code }})
        </a-list-item>
      </template>
    </a-list>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Modal as AModal,
  InputSearch as AInputSearch,
  List as AList,
  ListItem as AListItem,
  message
} from 'ant-design-vue'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible', 'add-stock'])

const searchQuery = ref('')
const searching = ref(false)
const searchResults = ref<any[]>([])
const selectedStock = ref<any | null>(null)

// 模拟的搜索结果
const allStocks = [
  { name: '贵州茅台', code: '600519', market: 'SH', price: '1650.50' },
  { name: '腾讯控股', code: '00700', market: 'HK', price: '380.20' },
  { name: '宁德时代', code: '300750', market: 'SZ', price: '190.80' },
  { name: '比亚迪', code: '002594', market: 'SZ', price: '210.50' },
  { name: '药明康德', code: '603259', market: 'SH', price: '45.60' },
  { name: '阿里巴巴', code: 'BABA', market: 'US', price: '85.32' },
  { name: '苹果公司', code: 'AAPL', market: 'US', price: '170.88' }
]

const onSearch = () => {
  if (!searchQuery.value) {
    searchResults.value = []
    return
  }
  searching.value = true
  // 模拟异步搜索
  setTimeout(() => {
    searchResults.value = allStocks.filter(
      (stock) => stock.name.includes(searchQuery.value) || stock.code.includes(searchQuery.value)
    )
    searching.value = false
  }, 500)
}

const selectStock = (stock: any) => {
  selectedStock.value = stock
}

const handleOk = () => {
  if (selectedStock.value) {
    emit('add-stock', selectedStock.value)
    resetModal()
    emit('update:visible', false)
  } else {
    message.warning('请先选择一支股票')
  }
}

const handleCancel = () => {
  resetModal()
  emit('update:visible', false)
}

const resetModal = () => {
  searchQuery.value = ''
  searchResults.value = []
  selectedStock.value = null
}
</script>

<style scoped lang="scss">
.search-results {
  margin-top: 16px;
  max-height: 300px;
  overflow-y: auto;
}
.search-results .ant-list-item {
  cursor: pointer;
  &.active {
    background-color: #e6f7ff;
  }
  &:hover {
    background-color: #f0f8ff;
  }
}
</style>
