<template>
  <div class="title-bar">
    <div class="title-bar__drag-region"></div>
    <div class="title-bar__controls">
      <div class="title-bar__control" @click="minimize">
        <LineOutlined />
      </div>
      <div class="title-bar__control" @click="maximize">
        <ExpandOutlined v-if="!isMaximized" />
        <CompressOutlined v-else />
      </div>
      <div class="title-bar__control title-bar__control--close" @click="close">
        <CloseOutlined />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { applicationApi } from '@api/application'
import {
  LineOutlined,
  CloseOutlined,
  CompressOutlined,
  ExpandOutlined
} from '@ant-design/icons-vue'
const isMaximized = ref(false)

let unlisten: () => void

onMounted(() => {
  unlisten = applicationApi.onWindowStateChange((state) => {
    isMaximized.value = state === 'maximized'
  })
})

onUnmounted(() => {
  if (unlisten) {
    unlisten()
  }
})

const minimize = () => {
  applicationApi.minimizeWindow()
}

const maximize = () => {
  applicationApi.maximizeWindow()
}

const close = () => {
  applicationApi.closeWindow()
}
</script>

<style scoped>
.title-bar {
  display: flex;
  height: 32px;
  -webkit-app-region: drag;
  background-color: var(--bg-container);
}

.title-bar__drag-region {
  flex-grow: 1;
}

.title-bar__controls {
  display: flex;
  -webkit-app-region: no-drag;
}

.title-bar__control {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 32px;
  cursor: pointer;
}

.title-bar__control:hover {
  background-color: var(--bg-hover);
}

.title-bar__control--close:hover {
  background-color: var(--color-danger);
  color: #fff;
}

.title-bar__control svg {
  fill: #fff;
  stroke: #fff;
  stroke-width: 1;
}
</style>
