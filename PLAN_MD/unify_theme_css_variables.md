# 统一主题CSS变量任务计划

## 1. 任务目标

根据 `PLAN_MD/theme.md` 中的分析，统一整个应用的 CSS 变量体系。废弃在全局 CSS 文件中定义的静态颜色变量，全面采用在 `App.vue` 中通过 Ant Design Vue 的 `token` 动态生成的 CSS 变量。这将确保主题（尤其是深色/浅色模式切换）在所有组件中表现一致，解决 `WebSocket` 等页面主题切换不生效的问题。

## 2. 问题根源

- **两套变量系统共存**:
  1.  **动态系统 (正确)**: `App.vue` 文件使用 `antTheme.useToken()` 获取主题 `token`，并通过 `watchEffect` 将颜色值动态设置到 `document.documentElement` 的 CSS 变量上。这是我们期望的唯一标准。
  2.  **静态系统 (错误)**: 一个或多个全局 CSS 文件中定义了另一套写死的颜色变量（例如 `--color-background`, `--color-text`），并被 `WebSocket.vue` 等组件使用。

## 3. 详细实施步骤

### 步骤 1: 定位并分析现有的 CSS 变量定义

1.  **分析动态变量**:
    - 读取 `src/renderer/src/App.vue` 文件。
    - 仔细查看 `watchEffect` 函数内部，记录所有通过 `root.style.setProperty` 设置的 CSS 变量名及其对应的 Ant Design `token`。这将是我们后续替换的“标准变量名录”。

2.  **定位静态变量**:
    - 在 `src/renderer/src/assets/styles/` 目录下查找定义了 `:root`, `[data-theme='light']`, `[data-theme='dark']` 颜色变量的 CSS/SCSS 文件。
    - 搜索项目中所有使用 `--color-background` 和 `--color-text` 的地方，以确定影响范围。

### 步骤 2: 重构受影响的组件

1.  **定位 所有 组件**:
    - 根据项目结构位于 `src/renderer/src/` 目录和 `src/renderer/src/views/` 下的所有除了app.vue 以外的 `*.vue` 文件。

2.  **修改 组件样式**:
    - 打开组件的 `<style>` 部分。
    - 将所有对静态变量的引用按照规则替换为 `App.vue` 中定义的动态变量。

### 步骤 3: 全局审查与替换

1.  **全局搜索**:
    - 在整个 `src/renderer/src` 目录下，搜索所有的静态变量，搜索关键字 `var` 等。

2.  **逐一替换**:
    - 对于搜索到的每一个文件，都执行与步骤 2 相同的替换逻辑，将其更新为使用动态变量。

### 步骤 4: 清理冗余的 CSS 代码

1.  **移除静态变量定义**:
    - 回到在步骤 1.2 中找到的全局 CSS 文件。
    - 删除所有关于 `:root`, `[data-theme='light']`, `[data-theme='dark']` 的颜色变量定义。
    - **注意**: 只删除与 `App.vue` 中动态变量功能重复的颜色定义，保留其他必要的全局样式（如字体、布局等）。

## 4. 验证

1.  **启动应用**: 运行 `pnpm dev` 或相关启动命令。
2.  **功能测试**:
    - 导航到在步骤 3 中修改过的其他页面，重复主题切换测试，确保它们也表现正常。

3.  **回归测试**: 快速浏览应用的主要页面，确保此次修改没有引入新的视觉问题。
