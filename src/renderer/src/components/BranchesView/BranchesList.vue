<template>
  <a-card class="branches-table-card" :loading="loading">
    <template #title>
      <div class="card-header">
        <span>分支列表</span>
        <a-input
          v-model:value="searchQuery"
          placeholder="搜索分支"
          class="search-input"
          allow-clear
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>
      </div>
    </template>

    <a-table
      :data-source="filteredBranches"
      :columns="columns"
      :pagination="false"
      :scroll="{ x: 'max-content' }"
      row-key="name"
      v-model:expandedRowKeys="expandedRowKeys"
    >
      <template #expandedRowRender="{ record }">
        <div class="branch-detail">
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="最后提交者">
              {{ record.lastCommitAuthor }}
            </a-descriptions-item>
            <a-descriptions-item label="提交日期">
              {{ formatDate(record.lastCommitDate) }}
            </a-descriptions-item>
            <a-descriptions-item label="提交ID">
              <a-tag size="small" color="blue">{{ record.lastCommitHash }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="提交消息">
              {{ record.lastCommitMessage }}
            </a-descriptions-item>
          </a-descriptions>
        </div>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <div class="branch-status">
            <StarOutlined v-if="record.name === 'main'" style="color: #67c23a" />
            <LinkOutlined v-else-if="record.isRemote" style="color: #409eff" />
            <ShareAltOutlined v-else style="color: #e6a23c" />
          </div>
        </template>
        <template v-else-if="column.key === 'name'">
          <div class="branch-name">
            <span>{{ record.name }}</span>
            <a-tag v-if="record.current" color="green">当前分支</a-tag>
            <a-tag v-if="record.isRemote" color="blue">远程</a-tag>
          </div>
        </template>
        <template v-else-if="column.key === 'lastUpdate'">
          {{ formatDate(record.lastCommitDate) }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-button-group>
            <a-button
              size="small"
              :disabled="record.current"
              @click="$emit('checkout', record)"
              style="margin-right: 5px"
            >
              切换
            </a-button>
            <a-button
              size="small"
              type="primary"
              :disabled="record.name === 'main'"
              @click="$emit('merge', record)"
              style="margin-right: 5px"
            >
              合并
            </a-button>
            <a-button
              size="small"
              type="primary"
              danger
              :disabled="record.name === 'main' || record.current"
              @click="$emit('delete', record)"
            >
              删除
            </a-button>
          </a-button-group>
        </template>
      </template>
    </a-table>
  </a-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { SearchOutlined, StarOutlined, LinkOutlined, ShareAltOutlined } from '@ant-design/icons-vue'
import type { PropType } from 'vue'
import { useFormatters } from '@composables/useFormatters'

interface Branch {
  name: string
  current: boolean
  isRemote: boolean
  commitsCount: number
  lastCommitHash: string
  lastCommitAuthor: string
  lastCommitDate: string
  lastCommitMessage: string
}

const props = defineProps({
  branches: { type: Array as PropType<Branch[]>, required: true },
  loading: { type: Boolean, default: false }
})

defineEmits(['checkout', 'merge', 'delete'])

const { formatDate } = useFormatters()

const searchQuery = ref('')
const expandedRowKeys = ref<string[]>([])

const filteredBranches = computed(() => {
  if (!searchQuery.value) return props.branches
  const query = searchQuery.value.toLowerCase()
  return props.branches.filter(
    (branch: Branch) =>
      branch.name.toLowerCase().includes(query) ||
      branch.lastCommitMessage.toLowerCase().includes(query) ||
      branch.lastCommitAuthor.toLowerCase().includes(query)
  )
})

const columns = ref([
  {
    title: '状态',
    key: 'status',
    width: 60
  },
  {
    title: '分支名称',
    dataIndex: 'name',
    key: 'name',
    minWidth: 200
  },
  {
    title: '提交数',
    dataIndex: 'commitsCount',
    key: 'commitsCount',
    width: 100,
    sorter: (a: Branch, b: Branch) => a.commitsCount - b.commitsCount
  },
  {
    title: '最近更新',
    key: 'lastUpdate',
    width: 180
  },
  {
    title: '操作',
    key: 'action',
    width: 200
  }
])
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-input {
  max-width: 250px;
}

.branches-table-card {
  margin-bottom: 20px;
}

.branch-detail {
  padding: 15px;
}

.branch-status {
  display: flex;
  justify-content: center;
  align-items: center;
}

.branch-name {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
