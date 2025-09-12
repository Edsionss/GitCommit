<template>
  <div class="capital-flow-container">
    <h3 class="title">资金流向</h3>
    <div class="summary-cards">
      <div class="card">
        <div class="card-title">主力净流入</div>
        <div class="card-value is-up">+150.2 亿</div>
      </div>
      <div class="card">
        <div class="card-title">超大单净流入</div>
        <div class="card-value is-up">+80.5 亿</div>
      </div>
      <div class="card">
        <div class="card-title">北向资金</div>
        <div class="card-value is-down">-25.1 亿</div>
      </div>
    </div>
    <a-table :columns="columns" :data-source="data" :pagination="false" size="small" class="flow-table">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'mainFlow'">
          <span :class="{ 'is-up': record.mainFlow > 0, 'is-down': record.mainFlow < 0 }">
            {{ (record.mainFlow / 10000).toFixed(2) }} 万
          </span>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { Table as ATable } from 'ant-design-vue'

const columns = reactive([
  { title: '股票名称', dataIndex: 'name', key: 'name' },
  { title: '最新价', dataIndex: 'price', key: 'price' },
  { title: '主力净流入', dataIndex: 'mainFlow', key: 'mainFlow', align: 'right' }
])

const data = reactive([
  { key: '1', name: '贵州茅台', price: '1650.50', mainFlow: 320450000 },
  { key: '2', name: '宁德时代', price: '190.80', mainFlow: 210340000 },
  { key: '3', name: '比亚迪', price: '210.50', mainFlow: -89760000 },
  { key: '4', name: '隆基绿能', price: '25.50', mainFlow: 150230000 },
  { key: '5', name: '通威股份', price: '30.80', mainFlow: -45890000 }
])
</script>

<style scoped lang="scss">
.capital-flow-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
}

.summary-cards {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;

  .card {
    flex: 1;
    padding: 15px;
    border-radius: 8px;
    background-color: #f9f9f9;
    text-align: center;

    .card-title {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }

    .card-value {
      font-size: 18px;
      font-weight: bold;
    }
  }
}

.is-up {
  color: #ff4d4f;
}

.is-down {
  color: #52c41a;
}

.flow-table {
  flex-grow: 1;
}
</style>