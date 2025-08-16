<template>
  <a-modal :open="visible" title="选择显示列" @ok="handleOk" @update:open="updateVisible">
    <a-checkbox-group v-model:value="internalSelectedColumns" style="width: 100%">
      <div class="column-dialog-content">
        <a-checkbox v-for="col in availableColumns" :key="col.value" :value="col.value">
          {{ col.label }}
        </a-checkbox>
      </div>
    </a-checkbox-group>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
  visible: Boolean,
  availableColumns: Array as () => Array<{ label: string; value: string }>,
  selectedColumns: Array as () => Array<string>
});

const emit = defineEmits(['update:visible', 'applyColumnSelection']);

const internalSelectedColumns = ref([...props.selectedColumns]);

watch(() => props.selectedColumns, (newVal) => {
  internalSelectedColumns.value = [...newVal];
});

const handleOk = () => {
  emit('applyColumnSelection', internalSelectedColumns.value);
};

const updateVisible = (value: boolean) => {
  emit('update:visible', value);
};
</script>

<style scoped>
.column-dialog-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  padding: var(--spacing-md) 0;
}
</style>
