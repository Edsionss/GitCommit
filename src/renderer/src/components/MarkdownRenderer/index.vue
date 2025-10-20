<template>
  <div ref="containerRef" class="markdown-content" v-html="htmlContent" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { markdownIt } from '@/utils/markdownIt' // 导入单例
import { useInteractiveMarkdown } from '@/composables/useInteractiveMarkdown'

const props = defineProps<{
  content: string
}>()

// 使用 composable 获取 ref 并激活交互
const { containerRef } = useInteractiveMarkdown()

// 计算要渲染的 HTML
const htmlContent = computed(() => markdownIt.render(props.content))
</script>

<style scoped lang="scss">
/* 
  使用 :deep() 伪类来让样式穿透到 v-html 或 innerHTML 生成的子组件中。
  我们将所有针对动态内容的样式规则都包裹在 :deep() 中。
*/

.markdown-content :deep(pre) {
  padding: 0px;
  background: transparent;
  border: none;
  margin-bottom: -35px;
}

:deep(.code-block-wrapper) {
  background-color: var(--bg-container) !important;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  top: -50px;
  /* 代码块工具栏 */
  .code-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background-color: var(--bg-layout);
    color: #ccc;
    font-size: 14px;
  }

  .lang-name {
    font-family: monospace;
    font-weight: bold;
  }

  .toolbar-buttons {
    display: flex;
    gap: 8px;
  }

  /* 工具栏按钮通用样式 */
  .code-toolbar button {
    background-color: transparent;
    border: none;
    color: #ccc;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 6px;
    border-radius: 4px;
    transition: background-color 0.2s;

    &:hover {
      background-color: #555;
      color: #fff;
    }
  }

  /* 按钮内的 SVG 图标 */
  .code-toolbar button svg {
    width: 1em;
    height: 1em;
  }

  /* 折叠状态的样式 */
  &.collapsed pre {
    display: none;
  }

  /* 覆盖 highlight.js 的默认样式 */
  pre.hljs {
    padding: 1em;
    margin: 0;
    overflow-x: auto;
    background-color: transparent;
  }
}
</style>
