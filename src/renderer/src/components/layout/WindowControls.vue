<template>
  <div class="window-menu">
    <div class="menu-box">
      <LineOutlined @click="minimize" />
    </div>
    <div class="menu-box" @click="maximize">
      <ExpandOutlined v-if="!isMaximized" />
      <CompressOutlined v-else />
    </div>
    <div class="menu-box danger">
      <CloseOutlined @click="close" />
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

<style scoped lang="scss">
.window-menu {
  display: flex;
  align-items: center;
  cursor: pointer;
  -webkit-app-region: no-drag;

  .menu-box {
    display: flex;
    align-items: center;
    padding: 12px;
    border-radius: 50%;
    -webkit-app-region: no-drag;
    pointer-events: auto;
  }
  .menu-box:hover {
    background-color: var(--bg-hover);
  }

  .danger:hover {
    background-color: var(--color-danger);
    color: #fff;
  }
}
</style>
