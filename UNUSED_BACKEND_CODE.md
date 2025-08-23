# 未使用的后端 API 接口

本文档列出了所有未被前端代码调用的后端接口和代码，这些是潜在的可以被清理和优化的冗余代码。

---

## 1. `saveFile`

- **功能**: 保存文件到本地磁盘，支持多种格式，并能处理大文件分卷保存。
- **后端位置**: `src/main/modules/fileSystem.ts`
- **IPC Channel**: `save-file`
- **状态**: **未被使用**。该方法通过预加载脚本（preload）暴露给了前端，但在整个前端代码库中没有找到任何调用它的地方。

---

## 2. `onAddLog`

- **功能**: 一个事件监听器，用于在主进程中向渲染进程发送日志消息。
- **后端位置**: `src/preload/index.ts` (通过 `logApi` 暴露)
- **IPC Channel**: `add-log`
- **状态**: **未被使用**。该监听器通过 `logApi` 暴露给了前端，但在前端代码中没有找到任何使用 `window.logApi.onAddLog` 的地方。

---

## 3. `ping`

- **功能**: 一个用于测试 IPC 通信的简单监听器。
- **后端位置**: `src/main/modules/ipcHandlers.ts`
- **IPC Channel**: `ping`
- **状态**: **未被使用**。这是一个内部测试接口，没有通过预加载脚本（preload）暴露给前端，因此前端无法调用。
