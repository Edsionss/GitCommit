### **开发进度：动态启动模式 (Dynamic Startup Mode)**

- [ ] **阶段一：准备工作**
  - [x] 创建开发设计文档 `DevelopmentDocument/DynamicStartupMode.md`。
  - [x] 创建开发进度文档 `DevelopmentProgress/DynamicStartupMode.md`。
  - [ ] 定位 `electron-conf` 服务层实现。
  - [ ] 确认前端设置页面的 Vue 组件路径。

- [ ] **阶段二：后端实现**
  - [ ] **类型定义**: 在 `src/renderer/src/types/setting.ts` 的 `SystemConfig` 中添加 `startupMode` 字段。
  - [ ] **主进程重构**: 将 `src/main/index.ts` 的逻辑迁移到 `src/main/main.ts` 的生命周期函数中。
  - [ ] **启动逻辑实现**: 在 `src/main/main.ts` 的 `whenReady` 函数中，添加根据 `electron-conf` 配置决定启动模式的逻辑。
  - [ ] **设置处理器**: 在 `handlers/settings` 中添加 `settings:set-startup-mode` 的 IPC 处理器，实现保存配置和重启应用的功能。
  - [ ] **Puppeteer 服务重构**: 基于原有的 `connect` 模式，将 `PuppeteerService` 改造为支持 `connect` 和 `launch` 的混合服务。

- [ ] **阶段三：前端实现**
  - [ ] 在设置页面的 Vue 组件中，添加用于选择 `startupMode` 的下拉框。
  - [ ] 实现与后端的 IPC 调用，传递用户的选择。
  - [ ] 确保前端能正确加载和显示当前存储的 `startupMode`。

- [ ] **阶段四：验证**
  - [ ] 在开发环境中测试“应用模式”是否正常启动并可使用 Puppeteer 功能。
  - [ ] 在开发环境中测试“服务模式”是否能通过 `pnpm dev:server` 正常启动。
  - [ ] 测试从前端设置页面切换模式，并确认重启后应用以新模式启动。
