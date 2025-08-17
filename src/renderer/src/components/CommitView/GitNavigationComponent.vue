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
// 接收父组件传入的属性
defineProps<{
  navItems: Array<{ id: string; label: string }>
  activeSection: string
}>()

const emit = defineEmits(['update:activeSection', 'scrollTo'])

// 滚动到指定区域
const scrollToSection = (sectionId: string) => {
  emit('scrollTo', sectionId)
}
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
  color: var(--text-muted);
  position: relative;
  cursor: pointer;
}

.nav-link.active {
  color: var(--primary-color);
}

.nav-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--text-muted);
  margin-right: 8px;
}

.nav-link.active .nav-dot {
  background-color: var(--primary-color);
  width: 10px;
  height: 10px;
}

.nav-link.active::before {
  content: '';
  position: absolute;
  left: 4px;
  height: 40px;
  width: 2px;
  background-color: var(--border-color);
  z-index: -1;
}

.nav-item:not(:last-child) .nav-link::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 12px;
  height: 30px;
  width: 2px;
  background-color: var(--border-color);
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
