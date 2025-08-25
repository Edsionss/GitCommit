<template>
  <a-modal title="添加自选股票" :visible="visible" @cancel="handleCancel" :footer="null">
    <a-steps :current="currentStep">
      <a-step title="搜索股票" />
      <a-step title="配置选项" />
      <a-step title="完成" />
    </a-steps>

    <div class="steps-content">
      <!-- Step 1: Search -->
      <div v-if="currentStep === 0">
        <a-input-search
          v-model:value="searchQuery"
          placeholder="输入股票名称或代码"
          enter-button="搜索"
          @search="onSearch"
          :loading="searching"
        />
        <a-list class="search-results" :data-source="searchResults" v-if="searchResults.length > 0">
          <template #renderItem="{ item }">
            <a-list-item @click="selectStock(item)">
              {{ item.name }} ({{ item.code }})
            </a-list-item>
          </template>
        </a-list>
      </div>

      <!-- Step 2: Configure -->
      <div v-if="currentStep === 1">
        <h4>配置获取选项 for {{ selectedStock?.name }}</h4>
        <a-form layout="vertical">
          <a-form-item label="K线天数">
            <a-select v-model:value="config.klineDays">
              <a-select-option :value="30">最近30天</a-select-option>
              <a-select-option :value="60">最近60天</a-select-option>
              <a-select-option :value="100">最近100天</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="均线设置">
            <a-select v-model:value="config.maLines" mode="tags" placeholder="例如: 5, 10, 20">
            </a-select>
          </a-form-item>
          <a-form-item label="技术指标">
            <a-checkbox-group v-model:value="config.indicators">
              <a-checkbox value="kdj">KDJ</a-checkbox>
              <a-checkbox value="boll">BOLL</a-checkbox>
              <a-checkbox value="macd">MACD</a-checkbox>
              <a-checkbox value="volume">成交量</a-checkbox>
              <a-checkbox value="rsi">RSI</a-checkbox>
            </a-checkbox-group>
          </a-form-item>
          <a-form-item label="获取资讯">
            <a-switch v-model:checked="config.fetchNews" />
          </a-form-item>
        </a-form>
      </div>

      <!-- Step 3: Fetching/Done -->
      <div v-if="currentStep === 2">
        <a-spin :spinning="isFetching" tip="正在爬取数据...">
          <div class="fetch-status">
            <a-result v-if="!isFetching && fetchSuccess" status="success" title="成功添加股票!">
            </a-result>
            <a-result
              v-if="!isFetching && !fetchSuccess"
              status="error"
              title="添加失败"
              sub-title="爬取数据时发生错误，请稍后重试。"
            >
            </a-result>
          </div>
        </a-spin>
      </div>
    </div>

    <div class="steps-action">
      <a-button v-if="currentStep > 0 && currentStep < 2" @click="prevStep">上一步</a-button>
      <a-button v-if="currentStep < 1" type="primary" @click="nextStep" :disabled="!selectedStock"
        >下一步</a-button
      >
      <a-button v-if="currentStep === 1" type="primary" @click="startFetching">开始爬取</a-button>
      <a-button v-if="currentStep === 2" type="primary" @click="handleFinish">完成</a-button>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, defineEmits, defineProps } from 'vue';
import {
  Modal as AModal, Steps as ASteps, Step as AStep, InputSearch as AInputSearch,
  List as AList, ListItem as AListItem, Form as AForm, FormItem as AFormItem,
  Select as ASelect, SelectOption as ASelectOption, CheckboxGroup as ACheckboxGroup,
  Checkbox as ACheckbox, Switch as ASwitch, Button as AButton, Spin as ASpin, Result as AResult, message
} from 'ant-design-vue';
import { useStockStore } from '@/stores/stock';
import { StockData } from '@/shared/types/dtos/stock';

const props = defineProps({ visible: Boolean });
const emit = defineEmits(['update:visible', 'finish']);

const stockStore = useStockStore();

const currentStep = ref(0);
const searchQuery = ref('');
const searching = ref(false);
const searchResults = ref<{ code: string; name: string }[]>([]);
const selectedStock = ref<{ code: string; name: string } | null>(null);

const config = reactive({
  klineDays: 100,
  maLines: [5, 10, 20],
  indicators: ['macd', 'volume'],
  fetchNews: true,
});

const isFetching = ref(false);
const fetchSuccess = ref(false);

const onSearch = async () => {
  if (!searchQuery.value) return;
  searching.value = true;
  try {
    searchResults.value = await window.api.invoke('stock:search', searchQuery.value);
  } catch (error) {
    message.error('搜索失败');
  } finally {
    searching.value = false;
  }
};

const selectStock = (stock: { code: string; name: string }) => {
  selectedStock.value = stock;
};

const nextStep = () => {
  currentStep.value++;
};

const prevStep = () => {
  currentStep.value--;
};

const startFetching = async () => {
  if (!selectedStock.value) return;
  currentStep.value++;
  isFetching.value = true;
  fetchSuccess.value = false;

  try {
    const fetchedData = await window.api.invoke('stock:fetch-advanced', selectedStock.value.code, config);
    
    if (fetchedData) {
        const fullStockData: StockData = {
            ...selectedStock.value,
            ...fetchedData,
            analysisHistory: [], // Initialize with empty history
        };
        await stockStore.addStockWithOptions(fullStockData);
        fetchSuccess.value = true;
    } else {
        throw new Error('Failed to fetch data from main process');
    }

  } catch (error) {
    console.error('Failed to fetch stock data:', error);
    fetchSuccess.value = false;
  } finally {
    isFetching.value = false;
  }
};

const handleCancel = () => {
  resetWizard();
  emit('update:visible', false);
};

const handleFinish = () => {
  resetWizard();
  emit('update:visible', false);
  emit('finish');
};

const resetWizard = () => {
  currentStep.value = 0;
  searchQuery.value = '';
  searchResults.value = [];
  selectedStock.value = null;
  isFetching.value = false;
  fetchSuccess.value = false;
  Object.assign(config, {
    klineDays: 100,
    maLines: [5, 10, 20],
    indicators: ['macd', 'volume'],
    fetchNews: true,
  });
};

</script>

<style scoped>
.steps-content {
  margin-top: 24px;
  padding: 24px;
  /* background-color: #fafafa; */
  /* border: 1px solid #e9e9e9; */
  border-radius: 2px;
  min-height: 300px;
}
.steps-action {
  margin-top: 24px;
  text-align: right;
}
.search-results .ant-list-item {
  cursor: pointer;
}
.search-results .ant-list-item:hover {
  background-color: #e6f7ff;
}
.fetch-status {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 250px;
}
</style>
