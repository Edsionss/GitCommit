# 已使用的后端 API 接口

本文档列出了所有被前端代码调用的后端接口，并标注了其在前端和后端的代码位置。

---

## 1. `selectDirectory`

- **功能**: 打开系统对话框让用户选择一个目录。
- **后端位置**: `src/main/modules/fileSystem.ts` (IPC Channel: `select-directory`)
- **前端调用位置**:
  - `src/renderer/src/components/BasicSettings/hooks/settingsForm.ts`
  - `src/renderer/src/views/Settings.vue`
  - `src/renderer/src/components/RepositoryView/AddEditRepositoryDialog.vue`

---

## 2. `validateRepoPath`

- **功能**: 验证给定路径是否是一个有效的 Git 仓库。
- **后端位置**: `src/main/modules/git/git-utils.ts` (IPC Channel: `validate-repo-path`)
- **前端调用位置**:
  - `src/renderer/src/views/BasicSettings.vue`
  - `src/renderer/src/components/BasicSettings/SettingsForm.vue`
  - `src/renderer/src/components/BasicSettings/hooks/settingsForm.ts`

---

## 3. `getRepoAuthors`

- **功能**: 获取一个或多个 Git 仓库的作者列表。
- **后端位置**: `src/main/modules/git/git-info.ts` (IPC Channel: `get-repo-authors`)
- **前端调用位置**:
  - `src/renderer/src/components/BasicSettings/hooks/settingsForm.ts`

---

## 4. `getRepoBranches`

- **功能**: 获取指定 Git 仓库的分支列表。
- **后端位置**: `src/main/modules/git/git-info.ts` (IPC Channel: `git:getBranches`)
- **前端调用位置**:
  - `src/renderer/src/components/BasicSettings/hooks/settingsForm.ts`

---

## 5. `getSubRepos`

- **功能**: 查找指定目录下所有的 Git 子仓库。
- **后端位置**: `src/main/modules/git/git-utils.ts` (IPC Channel: `get-sub-repos`)
- **前端调用位置**:
  - `src/renderer/src/components/BasicSettings/hooks/settingsForm.ts`

---

## 6. `scanGitRepo`

- **功能**: 根据指定选项扫描 Git 仓库并返回提交记录。
- **后端位置**: `src/main/modules/git/git-scan.ts` (IPC Channel: `scan-git-repo`)
- **前端调用位置**:
  - `src/renderer/src/views/BasicSettings.vue`

---

## 7. `cancelScan`

- **功能**: 取消正在进行的 Git 仓库扫描操作。
- **后端位置**: `src/main/modules/git/git-scan.ts` (IPC Channel: `cancel-scan`)
- **前端调用位置**:
  - `src/renderer/src/views/BasicSettings.vue`

---

## 8. `aiChat`

- **功能**: 与 AI 服务进行聊天交互。
- **后端位置**: `src/main/modules/ai/ai-handlers.ts` (IPC Channel: `ai:chat`)
- **前端调用位置**:
  - `src/renderer/src/components/AiChat/ChatBox.vue`
  - `src/renderer/src/composables/ai.ts`

---

## 9. `onScanProgress`

- **功能**: 监听扫描进度的事件。
- **后端位置**: `src/main/modules/git/git-scan.ts` (Event Emitter: `scan-progress`)
- **前端调用位置**:
  - `src/renderer/src/components/BasicSettings/LogPanel.vue`

---

## 10. `onScanError`

- **功能**: 监听扫描错误的事件。
- **后端位置**: `src/main/modules/git/git-scan.ts` (Event Emitter: `scan-error`)
- **前端调用位置**:
  - `src/renderer/src/components/BasicSettings/LogPanel.vue`

---

## 11. `onScanCancelled`

- **功能**: 监听扫描取消的事件。
- **后端位置**: `src/main/modules/git/git-scan.ts` (Event Emitter: `scan-cancelled`)
- **前端调用位置**:
  - `src/renderer/src/components/BasicSettings/LogPanel.vue`
