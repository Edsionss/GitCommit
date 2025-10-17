<template>
  <div
    class="segmented-control"
    :class="[variant, { disabled: props.disabled }]"
    :style="styleVars"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="option-item"
      :class="{
        active: modelValue === option.value,
        disabled: props.disabled || option.disabled
      }"
      :disabled="props.disabled || option.disabled"
      @click="handleOptionClick(option)"
    >
      <span v-if="option.icon" class="option-icon">
        <component :is="option.icon" />
      </span>
      <span v-if="option.label" class="option-label">{{ option.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Component, StyleValue } from 'vue'

// 1. API 定义 (Props & Emits)

interface OptionType {
  value: string | number
  label?: string
  icon?: Component
  disabled?: boolean
}

interface SegmentedControlProps {
  /**
   * 选项配置数组
   */
  options: OptionType[]
  /**
   * 当前选中的值，用于 v-model
   */
  modelValue: string | number
  /**
   * 整体禁用
   */
  disabled?: boolean
  /**
   * 视觉风格: outlined | ghost | filled
   */
  variant?: 'outlined' | 'ghost' | 'filled'
  /**
   * 组件容器的背景颜色
   */
  backgroundColor?: string
  /**
   * 选中项的背景颜色
   */
  activeBackgroundColor?: string
  /**
   * 选中项的文本/图标颜色
   */
  activeColor?: string
  /**
   * 未选中项的文本/图标颜色
   */
  inactiveColor?: string
  /**
   * 组件容器的边框圆角
   */
  borderRadius?: string | number
  // 选项项的内边距
  padding?: string | number
  // 选项项的边框颜色
  borderColor?: string
}

const props = withDefaults(defineProps<SegmentedControlProps>(), {
  disabled: false,
  variant: 'outlined',
  inactiveColor: '#6b7280',
  borderRadius: '8px',
  padding: '5px',
  borderColor: '#d9d9d9'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

// 2. 核心逻辑 (Handlers & Computed)

/**
 * 处理选项点击事件
 * @param option 点击的选项对象
 */
const handleOptionClick = (option: OptionType): void => {
  if (props.disabled || option.disabled) {
    return
  }
  emit('update:modelValue', option.value)
}

/**
 * 计算动态样式，通过 CSS 变量注入
 */
const styleVars = computed<StyleValue>(() => {
  // 定义三种 variant 的默认颜色
  const variantDefaults = {
    outlined: {
      bg: '#f0f0f0',
      activeBg: '#ffffff',
      activeColor: '#096dd9'
    },
    ghost: {
      bg: 'transparent',
      activeBg: '#f0f0f0',
      activeColor: '#000000'
    },
    filled: {
      bg: '#e6f4ff',
      activeBg: '#096dd9',
      activeColor: '#ffffff'
    }
  }

  const currentDefaults = variantDefaults[props.variant]

  // 优先使用 prop 传入的颜色，否则使用 variant 的默认值
  return {
    '--border-radius':
      typeof props.borderRadius === 'number' ? `${props.borderRadius}px` : props.borderRadius,
    '--background-color': props.backgroundColor ?? currentDefaults.bg,
    '--active-background-color': props.activeBackgroundColor ?? currentDefaults.activeBg,
    '--active-color': props.activeColor ?? currentDefaults.activeColor,
    '--inactive-color': props.inactiveColor,
    '--padding': typeof props.padding === 'number' ? `${props.padding}px` : props.padding,
    '--border-color': props.borderColor
  }
})
</script>

<style scoped>
/* 3. 样式实现 (Styling) */

.segmented-control {
  display: inline-flex;
  align-items: center;
  padding: var(--padding);
  border-radius: var(--border-radius);
  background-color: var(--background-color);
  transition: background-color 0.3s ease;
  user-select: none;
  -webkit-user-select: none; /* for Safari */
  border: 1px solid var(--border-color);
}

/* 针对不同 variant 的细微调整 */
.segmented-control.outlined {
  /* border: 1px solid #d9d9d9; */
}

.segmented-control.ghost {
  padding: 0; /* ghost 模式通常没有内边距和背景 */
}

.option-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 6px 16px;
  border: none;
  background-color: transparent;
  color: var(--inactive-color);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-radius: calc(var(--border-radius) - 2px); /* 内部圆角略小于外部 */
  transition:
    color 0.3s ease,
    background-color 0.3s ease;
  white-space: nowrap;
}

.option-item.active {
  color: var(--active-color);
  background-color: var(--active-background-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.option-item:not(.active):not(.disabled):hover {
  background-color: rgba(0, 0, 0, 0.04);
}

/* 禁用状态 */
.segmented-control.disabled,
.option-item.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.segmented-control.disabled .option-item:hover,
.option-item.disabled:hover {
  background-color: transparent;
}

/* 图标和文本样式 */
.option-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 1em;
  width: 1em;
}

.option-label:not(:empty) + .option-icon,
.option-icon + .option-label:not(:empty) {
  margin-left: 8px;
}

/* 确保 SVG 图标继承颜色 */
.option-icon :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
