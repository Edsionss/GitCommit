# 组件化与数据重构计划

本文档用于追踪项目的组件化和数据提取重构进度。

## 总体目标

1.  将项目中功能复杂、代码臃肿的视图（View）拆分为多个独立的、功能单一的子组件。
2.  将所有硬编码的测试/模拟数据从组件中提取到外部的 JSON 文件中，并通过 `import` 的方式引入，实现数据与视图的分离。

---

## 重构进度

### ✅ 1. Dashboard 页面 (`src/renderer/src/views/Dashboard.vue`)

- **组件化**: 已完成
- **样式清理**: 已完成
- **下一步**: 提取模拟数据到 `src/renderer/src/mock/` 目录。

### ✅ 2. Commits 页面 (`src/renderer/src/views/CommitsView.vue`)

- **组件化**: 已完成
- **样式清理**: 已完成
- **下一步**: 提取模拟数据到 `src/renderer/src/mock/` 目录。

### ✅ 3. Branches 页面 (`src/renderer/src/views/BranchesView.vue`)

- **组件化**: 已完成
- **样式清理**: 已完成
- **下一步**: 提取模拟数据到 `src/renderer/src/mock/` 目录。

### ✅ 4. Contributors 页面 (`src/renderer/src/views/Contributors.vue`)

- **组件化**: 已完成
- **样式清理**: 已完成
- **下一步**: 提取模拟数据到 `src/renderer/src/mock/` 目录。

### ✅ 5. 全局数据提取与最终组件化

- **状态**: 已完成
- **任务**: 
  - [x] 提取 `Dashboard.vue` 的模拟数据。
  - [x] 提取 `CommitsView.vue` 的模拟数据。
  - [x] 提取 `BranchesView.vue` 的模拟数据。
  - [x] 提取 `ContributorsView.vue` 的模拟数据。
  - [x] 检查并提取最终可复用的组件。

---

## 下一步行动

- **当前任务**: 开始提取 `Dashboard.vue` 的模拟数据。