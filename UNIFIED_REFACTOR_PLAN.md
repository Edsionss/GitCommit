# 统一后台架构重构计划

本文档综合了 `REFACTOR_PLAN.md`、`BACKEND_ARCHITECTURE_ANALYSIS.md` 和 `NEW_REFACTOR_PLAN.md` 的分析，旨在提供一份全面的、可执行的后台重构方案。

## 核心目标

1.  **彻底解耦**: 将核心业务逻辑（服务层）与UI展示（处理器层）完全分离，解决服务层对 `BrowserWindow` 的直接依赖问题。
2.  **统一模式**: 确保所有后台模块都遵循标准的“处理器-服务”（Handler/Service）分层模式。
3.  **明确结构**: 规范化文件和目录的命名，使项目结构更加清晰一致。
4.  **提升质量**: 最终达到提升代码可测试性、可维护性和健壮性的目标。

---

## 阶段 0: 准备工作

在开始任何代码修改之前，请先完成以下准备步骤，以确保重构过程安全可控。

1.  **创建新分支**: 从最新的 `main` 或 `develop` 分支创建一个新的特性分支。
    ```bash
    git checkout -b feature/backend-architecture-refactor
    ```
2.  **确认当前状态**: 确保项目的所有测试（如果有）都能通过，并且应用可以正常编译和运行。
3.  **代码格式化与 Lint**: 对整个项目运行一次代码格式化和 Lint 检查，确保起点是一个干净的状态。

---

## 阶段 1: 统一分层模式 - 重构 `fileSystem` 模块

此阶段目标是解决“分层模式不统一”的问题，将 `fileSystem.ts` 改造为标准的“处理器-服务”模式。

1.  **创建目录与文件**:
    *   在 `src/main/features/` 下创建 `fileSystem` 目录。
    *   在 `src/main/features/fileSystem/` 下创建 `file-system.service.ts`。
    *   在 `src/main/features/fileSystem/` 下创建 `file-system.handlers.ts`。

2.  **创建服务层 (`file-system.service.ts`)**:
    *   将 `fileSystem.ts` 中的核心逻辑抽象成服务函数。

    ```typescript
    // src/main/features/fileSystem/file-system.service.ts
    import { isValidGitRepo } from '../git/git-utils-service';

    export async function validateRepositoryPath(repoPath: string): Promise<{ path: string; isValid: boolean }> {
      const isValid = await isValidGitRepo(repoPath);
      return { path: repoPath, isValid };
    }
    ```

3.  **创建处理器层 (`file-system.handlers.ts`)**:
    *   将 `fileSystem.ts` 中的 `ipcMain.handle` 逻辑移动到此文件，并调用新创建的服务。

    ```typescript
    // src/main/features/fileSystem/file-system.handlers.ts
    import { ipcMain, dialog } from 'electron';
    import { validateRepositoryPath } from './file-system.service';

    export function registerFileSystemHandlers() {
      ipcMain.handle('select-directory', async () => {
        const result = await dialog.showOpenDialog({
          properties: ['openDirectory']
        });
        if (!result.canceled && result.filePaths.length > 0) {
          const repoPath = result.filePaths[0];
          return await validateRepositoryPath(repoPath);
        }
        return null;
      });
    }
    ```

4.  **更新全局处理器注册 (`ipcHandlers.ts`)**:
    *   修改 `src/main/features/ipcHandlers.ts`，更新导入路径。
    *   从: `import { registerFileSystemHandlers } from '@main/features/fileSystem'`
    *   改为: `import { registerFileSystemHandlers } from './fileSystem/file-system.handlers'`

5.  **清理**:
    *   删除根目录下的 `src/main/features/fileSystem.ts` 文件。

6.  **验证**:
    *   启动应用，测试“选择目录”功能，确保其行为与重构前完全一致。

---

## 阶段 2: 解耦服务层与UI层 - 重构 `git-scan` 模块 (核心)

此阶段是本次重构的核心，将移除 `git-scan-service.ts` 对 `BrowserWindow` 的直接依赖。

1.  **定义共享类型**:
    *   在 `src/shared/types/dtos/git.dto.ts` 中定义进度回调函数的类型。这可以确保前后端类型安全。

    ```typescript
    // src/shared/types/dtos/git.dto.ts
    export interface ScanProgress {
      phase: string;
      percentage: number;
      commits?: GitCommit[]; // 假设 GitCommit 类型已存在
    }
    export type ProgressCallback = (progress: ScanProgress) => void;
    ```

2.  **修改服务层 (`git-scan-service.ts`)**:
    *   移除 `import { BrowserWindow } from 'electron'`。
    *   修改 `scanGitRepository` 函数签名，使其接受一个可选的 `onProgress` 回调函数。
        ```typescript
        // 从:
        // export async function scanGitRepository(repoPath: string, options?: GitScanOptions, aiConfig?: AiConfig): Promise<...>
        
        // 改为:
        import type { ProgressCallback } from '@shared/types/dtos/git.dto';
        export async function scanGitRepository(repoPath: string, options?: GitScanOptions, aiConfig?: AiConfig, onProgress?: ProgressCallback): Promise<...>
        ```
    *   将所有 `mainWindow?.webContents.send('scan-progress', ...)` 的调用替换为 `onProgress?.(...)`。
        ```typescript
        // 找到类似这样的代码:
        // sendProgress('正在查找...', 5);
        
        // 替换为:
        if (onProgress) {
          onProgress({ phase: '正在查找...', percentage: 5 });
        }
        ```
    *   移除所有 `webContents.send('scan-error', ...)` 的逻辑。服务应通过 `throw new Error(...)` 来传递失败信息，由调用方（处理器）捕获。

3.  **修改处理器层 (`git-scan.ts`)**:
    *   在 `ipcMain.handle('scan-git-repo', ...)` 处理器中实现UI通信逻辑。

    ```typescript
    // src/main/features/git/git-scan.ts (修改后)
    import { ipcMain, BrowserWindow } from 'electron';
    import { scanGitRepository, setCancelScanFlag } from './git-scan-service';
    import type { GitScanOptions, AiConfig, ProgressCallback } from '@shared/types/dtos/git.dto';

    export function registerGitScanHandlers() {
      ipcMain.handle(
        'scan-git-repo',
        async (_, repoPath: string, options?: GitScanOptions, aiConfig?: AiConfig) => {
          const mainWindow = BrowserWindow.getAllWindows()[0];

          const progressCallback: ProgressCallback = (progress) => {
            mainWindow?.webContents.send('scan-progress', progress);
          };

          try {
            // 将回调函数注入服务
            return await scanGitRepository(repoPath, options, aiConfig, progressCallback);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            // 由处理器负责将错误发送到UI
            mainWindow?.webContents.send('scan-error', { message: errorMessage });
            // 重新抛出错误，让前端的 await 调用失败，进入 catch 块
            throw new Error(errorMessage);
          }
        }
      );
      // ... 其他处理器 (例如 'cancel-scan')
    }
    ```

4.  **验证**:
    *   启动应用，执行一次完整的仓库扫描。
    *   仔细观察并确认：进度条、状态信息、最终结果和错误信息都能正确地在UI上显示。
    *   测试取消扫描功能。

---

## 阶段 3: 规范化命名与结构

此阶段专注于提升代码库的一致性和可读性。

1.  **重命名处理器文件**:
    *   `src/main/features/git/git-scan.ts` -> `git-scan.handlers.ts`
    *   `src/main/features/git/git-info.ts` -> `git-info.handlers.ts`
    *   `src/main/features/git/git-utils.ts` -> `git-utils.handlers.ts`

2.  **更新导入路径**:
    *   在 `src/main/features/ipcHandlers.ts` 中，更新上述文件重命名后的导入路径。

3.  **清理 `export` 模块**:
    *   检查 `src/main/features/export.ts` 和 `src/main/features/export/` 目录。
    *   确认 `ipcHandlers.ts` 导入的是 `export/export-handlers.ts`。
    *   如果确认 `export.ts` 未被使用，请将其安全删除。

4.  **验证**:
    *   启动应用，快速测试Git信息获取、工具函数调用和导出功能，确保重命名和文件清理没有破坏任何功能。

---

## 阶段 4: 最终审查与合并

1.  **代码审查**:
    *   完整地审查 `feature/backend-architecture-refactor` 分支上的所有代码变更。
    *   确保所有修改都符合计划，并且代码风格一致。
2.  **最终测试**:
    *   对应用进行一次全面的回归测试，特别是所有与后台交互的功能。
3.  **合并分支**:
    *   将重构分支合并回主开发分支 (`main` 或 `develop`) 并删除特性分支。

此计划将指导您系统地完成后台架构的优化，每一步都构建在前一步成功的基础上，从而确保重构的质量和安全。
