# 组件化与数据重构计划

本文档用于追踪项目的组件化和数据提取重构进度。

## 总体目标

1.  将项目中功能复杂、代码臃肿的视图（View）拆分为多个独立的、功能单一的子组件。
2.  将所有硬编码的测试/模拟数据从组件中提取到外部的 JSON 文件中，并通过 `import` 的方式引入，实现数据与视图的分离。
3.  将项目使用的 UI 和图表库从 Element Plus 和 ECharts 迁移到 Ant Design Vue 和 Vue-ChartJS。

---

## 重构进度

### ✅ 1. Dashboard 页面 (`src/renderer/src/views/Dashboard.vue`)

- **组件化与样式清理**: 已完成
- **数据提取**: 已完成

### ✅ 2. Commits 页面 (`src/renderer/src/views/CommitsView.vue`)

- **组件化与样式清理**: 已完成
- **数据提取**: 已完成

### ✅ 3. Branches 页面 (`src/renderer/src/views/BranchesView.vue`)

- **组件化与样式清理**: 已完成
- **数据提取**: 已完成

### ✅ 4. Contributors 页面 (`src/renderer/src/views/Contributors.vue`)

- **组件化与样式清理**: 已完成
- **数据提取**: 已完成

### ✅ 5. 全局数据提取与最终组件化

- **状态**: 已完成

### 🚧 6. UI 库迁移

- **状态**: **进行中**
- **任务**:
  - [x] **图表库迁移 (ECharts -> Vue-ChartJS)**
    - [x] 改造 `CommitTrendChart.vue`
    - [x] 改造 `LanguageDistChart.vue`
    - [x] 改造 `ContributorDetails.vue`
  - [ ] **组件库迁移 (Element Plus -> Ant Design Vue)**
    - [x] 改造 `src/renderer/src/main.ts`
    - [x] 改造布局组件 (`src/renderer/src/components/layout/`)
      - [x] `TheHeader.vue`
      - [x] `TheSidebar.vue`
      - [x] `MainLayout.vue`
    - [x] 改造 Dashboard 相关组件 (`src/renderer/src/components/Dashboard/`)
      - [x] `StatsCards.vue`
      - [x] `CommitTrendChart.vue`
      - [x] `LanguageDistChart.vue`
      - [x] `RecentActivity.vue`
      - [x] `RepoOverview.vue`
    - [x] 改造 CommitsView 相关组件 (`src/renderer/src/components/CommitsView/`)
      - [x] `CommitsToolbar.vue`
      - [x] `CommitsList.vue`
      - [x] `CommitDetails.vue`
    - [x] 改造 BranchesView 相关组件 (`src/renderer/src/components/BranchesView/`)
      - [x] `BranchesToolbar.vue`
      - [x] `BranchesList.vue`
      - [x] `BranchSidebar.vue`
      - [x] `CreateBranchDialog.vue`
      - [x] `MergeBranchDialog.vue`
    - [x] 改造 ContributorsView 相关组件 (`src/renderer/src/components/ContributorsView/`)
      - [x] `ContributorsStats.vue`
      - [x] `ContributorsList.vue`
      - [x] `ContributorDetails.vue`
    - [ ] 改造所有视图文件 (`src/renderer/src/views/`)
      - [x] `Dashboard.vue`
      - [x] `CommitsView.vue`
      - [x] `BranchesView.vue`
      - [x] `Contributors.vue`
      - [x] `AdvancedSettings.vue`
      - [x] `BasicSettings.vue`
      - [x] `CodeAnalysis.vue`
      - [x] `Reports.vue`
      - [x] `Repository.vue`
      - [x] `Results.vue`
      - [x] `Settings.vue`
              - [x] `TableControlPanel.vue`
        - [ ] `CommitTable.vue`
        - [ ] `CommitDetailsDrawer.vue`
        - [ ] `ColumnSelectionDialog.vue`

---

## 下一步行动

- **当前任务**: 继续组件库的迁移工作，改造 `TableView.vue`。
