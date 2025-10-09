# 打包分析驱动的优化方案

**目标**: 针对 `stats.html` 报告暴露出的问题，对体积过大的第三方库进行精确优化，显著减小生产环境的打包体积。

---

### **第一步：优化 `chart.js` 的导入**

*   **问题**: 全量导入了 `chart.js`，打包了所有非必需的功能。
*   **措施**: 我将找到使用 `chart.js` 的图表组件，将其改为“按需注册”的树摇优化模式。
*   **具体操作**:
    1.  搜索并定位到项目中所有 `import Chart from 'chart.js'` 的地方。
    2.  将其修改为：
        ```typescript
        // 只导入核心的 Chart 类和需要用到的组件
        import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';

        // 只注册用到的组件
        Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);
        ```
    *   **预期效果**: `chart.js` 的打包体积预计可减少 **50%-70%**。

### **第二步：优化 `dayjs` 的体积**

*   **问题**: `ant-design-vue` 默认会引入一个完整的 `dayjs` 实例，可能包含所有语言包。
*   **措施**: 我将通过 Vite 的别名（alias）功能，强制 `ant-design-vue` 使用一个我们自定义的、轻量化的 `dayjs` 实例。
*   **具体操作**:
    1.  创建新文件 `src/renderer/src/plugins/dayjs.ts`，在其中只导入 `dayjs` 核心和中文语言包。
        ```typescript
        import dayjs from 'dayjs';
        import 'dayjs/locale/zh-cn';
        dayjs.locale('zh-cn');
        export default dayjs;
        ```
    2.  修改 `electron.vite.config.ts`，添加别名配置：
        ```typescript
        // renderer.resolve.alias 中
        alias: {
          'dayjs': resolve('src/renderer/src/plugins/dayjs.ts'),
          // ... 其他别名
        }
        ```
    *   **预期效果**: `dayjs` 的打包体积预计可减少 **80%** 以上。

### **第三步：根治 `ant-design-vue` 的导入问题**

*   **问题**: 存在不规范的手动导入，破坏了 `unplugin-vue-components` 的自动按需加载。
*   **措施**: 我将全局搜索不规范的导入，并将其移除。
*   **具体操作**:
    1.  在整个 `src/renderer` 目录中，搜索 `from 'ant-design-vue'`。
    2.  找到所有类似 `import { Button, message } from 'ant-design-vue'` 的语句。
    3.  将这些语句**彻底删除**。`unplugin-vue-components` 会自动处理组件的导入，而 `message` 等API应通过 `app.use` 全局挂载，或在需要时单独处理。
    *   **预期效果**: 确保 `ant-design-vue` 实现理想的 tree-shaking，体积可能进一步减小 **10%-20%**。
