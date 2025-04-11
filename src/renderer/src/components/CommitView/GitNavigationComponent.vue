<template>
  <div class="navigation-component">
    <div class="nav-item" v-for="(item, index) in navItems" :key="index">
      <div
        class="nav-link"
        :class="{ active: activeSection === item.id }"
        @click="scrollToSection(item.id)"
      >
        <div class="nav-dot"></div>
        <div class="nav-label">{{ item.label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, onMounted, onBeforeUnmount, watch } from 'vue'

// 接收父组件传入的属性
const props = defineProps<{
  navItems: Array<{ id: string; label: string }>
  activeSection: string
}>()

const emit = defineEmits(['update:activeSection', 'scrollTo'])

// 滚动到指定区域
const scrollToSection = (sectionId: string) => {
  emit('scrollTo', sectionId)
}

// 添加一个节流函数来优化性能
const throttle = (fn: Function, delay: number) => {
  let lastCall = 0
  return function (...args: any[]) {
    const now = new Date().getTime()
    if (now - lastCall < delay) {
      return
    }
    lastCall = now
    return fn(...args)
  }
}

// 监听滚动事件，更新活动导航项
const checkActiveSection = () => {
  const sections = props.navItems.map((item) => document.getElementById(item.id))
  const scrollPosition = window.scrollY + 100 // 添加偏移量

  // 从下到上检查各部分，找到第一个可见的部分
  for (let i = sections.length - 1; i >= 0; i--) {
    const section = sections[i]
    if (section) {
      const rect = section.getBoundingClientRect()
      // 检查元素是否在视口中
      if (rect.top <= 150 && rect.bottom >= 50) {
        emit('update:activeSection', props.navItems[i].id)
        return
      }
    }
  }
}

// 使用节流的滚动处理函数
const handleScroll = throttle(checkActiveSection, 100)

// 监听activeSection的变化
watch(
  () => props.activeSection,
  (newValue) => {
    // 确保导航项显示正确的活动状态
    if (newValue) {
      const activeElement = document.getElementById(newValue)
      if (activeElement && !isElementInViewport(activeElement)) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }
)

// 检查元素是否在视口中
const isElementInViewport = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

onMounted(() => {
  // 添加滚动事件监听
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.addEventListener('DOMContentLoaded', checkActiveSection)
  // 初始检查
  setTimeout(checkActiveSection, 100)
})

onBeforeUnmount(() => {
  // 移除滚动事件监听
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('DOMContentLoaded', checkActiveSection)
})
</script>

<style scoped>
.navigation-component {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.nav-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #909399;
  position: relative;
  cursor: pointer;
}

.nav-link.active {
  color: #409eff;
}

.nav-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #909399;
  margin-right: 8px;
}

.nav-link.active .nav-dot {
  background-color: #409eff;
  width: 10px;
  height: 10px;
}

.nav-link.active::before {
  content: '';
  position: absolute;
  left: 4px;
  height: 40px;
  width: 2px;
  background-color: #ebeef5;
  z-index: -1;
}

.nav-item:not(:last-child) .nav-link::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 12px;
  height: 30px;
  width: 2px;
  background-color: #ebeef5;
}

.nav-label {
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s;
}

.nav-link:hover .nav-label,
.nav-link.active .nav-label {
  opacity: 1;
  transform: translateX(0);
}
</style>
