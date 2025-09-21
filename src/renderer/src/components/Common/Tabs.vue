<template>
  <div class="custom-tabs-container">
    <div class="tabs-bar">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: modelValue === tab.key }"
        @click="onTabClick(tab.key)"
      >
        {{ tab.title }}
      </div>
    </div>
    <div class="tabs-content">
      <slot :active-tab="modelValue"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  tabs: {
    type: Array as () => Array<{ key: string; title: string }>,
    required: true
  },
  modelValue: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const onTabClick = (key: string) => {
  emit('update:modelValue', key)
}
</script>

<style scoped lang="scss">
.custom-tabs-container {
  display: flex;
  height: 100%;
}

.tabs-bar {
  width: 170px;
  border-right: 2px solid var(--border-secondary);
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.tab-item {
  padding: 10px 15px;
  cursor: pointer;
  align-items: center;
  text-align: center;
  border-radius: 4px;
  transition: all 0.3s ease;
  width: 120px;
  // writing-mode: vertical-rl;
  text-orientation: mixed;

  &:hover {
    background-color: var(--brand-primary-bg);
  }

  &.active {
    // background-color: #e6f7ff;
    background-color: var(--brand-primary-bg);
    color: var(--brand-primary);
    font-weight: bold;
  }
}

.tabs-content {
  flex-grow: 1;
  padding: 10px;
  height: 100%;
  width: 100%;
}
</style>
