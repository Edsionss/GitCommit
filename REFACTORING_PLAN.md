# Refactoring and Bug Fix Plan

This document tracks the status of ongoing refactoring and bug fixing tasks.

## Sprint 1

### Bugs

- [x] **[Fixed]** Fix repository path validation logic.
- [x] **[Fixed]** Subfolder scan mode was not correctly handled by path validation.
- [x] **[Fixed]** `window.api.getSubRepos` was not a function due to preload script not being updated.
- [x] **[Fixed]** Log panel text was not selectable.
- [x] **[Fixed]** Single-line layout for form items was not working.

### Features

- [x] Add loading state to the "Select Directory" button during validation.
- [x] Add a "Clear Path" button to the repository path input.
- [x] Implement scanning of subfolders.
- [x] Redesign the layout of the settings page to be two-column.
- [x] Make the log panel always visible and equal in height to the settings panel.
- [x] Refactor `BasicSettings.vue` into smaller components.
  - [x] `ActionPanel.vue` created.
  - [x] `LogPanel.vue` created.
  - [x] `SettingsForm.vue` created.
  - [x] `BasicSettings.vue` refactored to use new components.
- [x] **[Done]** The "Select Repository" dropdown should always be visible, but disabled when not applicable.
- [x] **[Done]** When `scanSubfolders` is turned off, the "Select Repository" box should be auto-populated with the current valid repo.

## Sprint 2

### Bugs

- [x] **[Fixed]** 修复了在主进程和渲染进程间传递数据时因对象无法被克隆而导致的 `An object could not be cloned` 错误。
- [x] **[Fixed]** 修复了开始扫描时会自动清空历史日志的问题。

### Features

- [x] **[Done]** 实现选择仓库后，自动加载对应的分支及作者列表，并为选择框提供 `loading` 状态。
- [x] **[Done]** 为“选择仓库”和“作者过滤”功能区添加了“全选”和“清空”按钮，以提升操作效率。

### Refactoring

- [ ] **[In Progress]** 重构主进程代码，将 `src/main/index.ts` 按功能拆分为多个独立的、易于维护的模块。
