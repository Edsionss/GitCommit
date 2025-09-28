<template>
  <div class="title-bar">
    <div class="title-bar__drag-region"></div>
    <div class="title-bar__controls">
      <div class="title-bar__control" @click="minimize">
        <!-- <svg width="12" height="12" viewBox="0 0 12 12"><path d="M0 5 H12 V7 H0z"></path></svg> -->
        <LineOutlined />
      </div>
      <div class="title-bar__control" @click="maximize">
        <!-- <svg v-if="!isMaximized" width="12" height="12" viewBox="0 0 12 12">
          <path d="M0 0 H12 V12 H0z M2 2 V10 H10 V2z"></path>
        </svg> -->
        <ExpandOutlined v-if="!isMaximized" />
        <CompressOutlined v-else />
        <!-- <svg v-else width="12" height="12" viewBox="0 0 12 12">
          <path d="M2 0 H10 V2 H2z M0 2 H2 V10 H0z M2 10 H10 V12 H2z M10 2 H12 V10 H10z"></path>
        </svg> -->
      </div>
      <div class="title-bar__control title-bar__control--close" @click="close">
        <!-- <svg width="12" height="12" viewBox="0 0 12 12">
          <path d="M0 0 L12 12 M0 12 L12 0"></path>
        </svg> -->
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
