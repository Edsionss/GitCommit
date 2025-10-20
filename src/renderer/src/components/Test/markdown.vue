<script setup lang="ts">
import MarkdownRender from 'vue-renderer-markdown'
import 'vue-renderer-markdown/index.css'
import { MarkdownCodeBlockNode, setCustomComponents } from 'vue-renderer-markdown'

setCustomComponents({
  code_block: MarkdownCodeBlockNode
})
const content = `
# Hello Vue Markdown

- 支持列表
- 支持 **加粗** / *斜体*

\`\`\`ts
console.log('流式渲染!')
\`\`\`
`
</script>

<template>
  <MarkdownRender
    :content="content"
    :render-code-blocks-as-pre="true"
    :is-dark="true"
    :code-block-dark-theme="'vitesse-dark'"
    :code-block-light-theme="'vitesse-light'"
  />
</template>
<style scoped lang="scss"></style>
