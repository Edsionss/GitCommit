<font style="color:rgb(26, 28, 30);">在 </font><font style="color:rgb(26, 28, 30);">App.vue</font><font style="color:rgb(26, 28, 30);"> 和这个 </font><font style="color:rgb(26, 28, 30);">WebSocket</font><font style="color:rgb(26, 28, 30);"> 页面组件中，</font>**<font style="color:rgb(26, 28, 30);">使用了两套不一致的 CSS 变量</font>**<font style="color:rgb(26, 28, 30);">。</font>

<font style="color:rgb(26, 28, 30);">我们来一步步分析。</font>

### <font style="color:rgb(26, 28, 30);">问题剖析：两套独立的 CSS 变量系统</font>

#### <font style="color:rgb(26, 28, 30);">1. 系统一：Ant Design Token 驱动的变量 (在</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">App.vue</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">中)</font>

<font style="color:rgb(26, 28, 30);">在你的</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">App.vue</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">中，你做了这件事：</font>

```plain
// App.vue
watchEffect(() => {
  const root = document.documentElement
  // 你在这里定义了 --bg-color
  root.style.setProperty('--bg-color', token.value.colorBgLayout)
  // ... 其他变量
})
```

```plain
/* App.vue */
body {
  /* 然后你在 body 上使用了它 */
  background-color: var(--bg-color);
}
```

<font style="color:rgb(26, 28, 30);">这个系统是</font>**<font style="color:rgb(26, 28, 30);">动态的、响应式的</font>**<font style="color:rgb(26, 28, 30);">。当</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">effectiveTheme</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">变化时，</font><font style="color:rgb(26, 28, 30);">antTheme.useToken()</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">会提供新的</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">token</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">值，</font><font style="color:rgb(26, 28, 30);">watchEffect</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">重新运行，并通过 JS 更新</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">--bg-color</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">这个 CSS 变量的值。</font>**<font style="color:rgb(26, 28, 30);">这是正确的、正在工作的系统。</font>**

#### <font style="color:rgb(26, 28, 30);">2. 系统二：静态 CSS 文件定义的变量 (在你的全局 CSS 和</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">WebSocket.vue</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">中)</font>

<font style="color:rgb(26, 28, 30);">在你的全局 CSS 文件中，你定义了另一套变量：</font>

```plain
/* 全局 CSS */
:root,
[data-theme='light'] {
  --color-background: #ffffff; /* 注意变量名不同 */
  /* ... */
}

[data-theme='dark'] {
  --color-background: #1e1e1e; /* 注意变量名不同 */
  /* ... */
}
```

<font style="color:rgb(26, 28, 30);">然后，在你的</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">WebSocket.vue</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">组件中，你使用了这套变量：</font>

```plain
/* WebSocket.vue */
.webSocket-container {
  /* ... */
  background-color: var(--color-background); /* 使用了第二套变量 */
}
```

### <font style="color:rgb(26, 28, 30);">冲突点在哪里？</font>

<font style="color:rgb(26, 28, 30);">你的</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">WebSocket.vue</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">组件渲染出来后，它的根元素是</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">.webSocket-container</font><font style="color:rgb(26, 28, 30);">。这个</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">div</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">的尺寸是</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">height: 100%</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">和</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">width: 100%</font><font style="color:rgb(26, 28, 30);">，它完全覆盖了</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);"><body></font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">元素。</font>

- <font style="color:rgb(26, 28, 30);">当主题切换时，</font><font style="color:rgb(26, 28, 30);">App.vue</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">中的</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">watchEffect</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">成功地更新了</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);"><body></font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">的</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">background-color</font><font style="color:rgb(26, 28, 30);">，因为它使用的是</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">var(--bg-color)</font><font style="color:rgb(26, 28, 30);">。</font>
- <font style="color:rgb(26, 28, 30);">但是，你看不见</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);"><body></font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">的背景，因为它被</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">.webSocket-container</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">这个</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">div</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">完全盖住了。</font>
- <font style="color:rgb(26, 28, 30);">.webSocket-container</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">的背景色由</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">var(--color-background)</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">决定。虽然你在 CSS 文件中也为</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">[data-theme='dark']</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">定义了</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">--color-background</font><font style="color:rgb(26, 28, 30);">，但</font>**<font style="color:rgb(26, 28, 30);">你的</font>\*\***<font style="color:rgb(26, 28, 30);"> </font>\***\*<font style="color:rgb(26, 28, 30);">App.vue</font>\*\***<font style="color:rgb(26, 28, 30);"> </font>\***\*<font style="color:rgb(26, 28, 30);">样式中已经为</font>\*\***<font style="color:rgb(26, 28, 30);"> </font>\***\*<font style="color:rgb(26, 28, 30);">body</font>\*\***<font style="color:rgb(26, 28, 30);"> </font>\***\*<font style="color:rgb(26, 28, 30);">设置了</font>\*\***<font style="color:rgb(26, 28, 30);"> </font>\***\*<font style="color:rgb(26, 28, 30);">background-color</font>\*\***<font style="color:rgb(26, 28, 30);">，这可能会导致预期外的层叠效果或混乱</font>\*\*<font style="color:rgb(26, 28, 30);">。</font>

<font style="color:rgb(26, 28, 30);">最核心的问题是：</font>**<font style="color:rgb(26, 28, 30);">你维护了两套功能重复的变量，导致了不一致性。</font>**

### <font style="color:rgb(26, 28, 30);">解决方案：统一 CSS 变量</font>

<font style="color:rgb(26, 28, 30);">你应该只使用一套变量来控制背景色。既然你已经集成了 Ant Design Vue，并且在</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">App.vue</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">中设置了基于 antd token 的变量，那么最佳实践就是在所有地方都使用这套变量。</font>

**<font style="color:rgb(26, 28, 30);">修改你的</font>\*\***<font style="color:rgb(26, 28, 30);"> </font>\***\*<font style="color:rgb(26, 28, 30);">WebSocket.vue</font>\*\***<font style="color:rgb(26, 28, 30);"> </font>\***\*<font style="color:rgb(26, 28, 30);">样式：</font>**

<font style="color:rgb(26, 28, 30);">将</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">.webSocket-container</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">的</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">background-color</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">指向你在</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">App.vue</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">中设置的变量。</font>

```plain
/* 在 WebSocket.vue 的 <style> 标签中 */

.webSocket-container {
  height: 100%;
  display: flex;
  width: 100%;
  padding: 10px;
  /*
    将 --color-background 修改为 --bg-color，
    与 App.vue 中定义的变量保持一致。
  */
  background-color: var(--bg-color);
  /*
    同样，文本颜色也应该使用 App.vue 定义的变量，
    比如 var(--text-primary)
  */
  color: var(--text-primary);
  overflow-y: auto;

  .chat-container {
    // ...
    .direct-container {
      // ...
      .direct-content {
        /*
          对于卡片、容器内部的背景色，
          使用 --bg-content 或者 --card-bg 更好
        */
        background-color: var(--bg-content);
      }
    }
  }
  // ...
}
```

**<font style="color:rgb(26, 28, 30);">为什么这样做是最好的？</font>**

- **<font style="color:rgb(26, 28, 30);">单一数据源</font>**<font style="color:rgb(26, 28, 30);">：你的所有颜色都来源于 Ant Design 的</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">token</font><font style="color:rgb(26, 28, 30);">。当 antd 主题更新或者你微调主题配置时，所有地方都会自动同步，无需维护多份 CSS 文件。</font>
- **<font style="color:rgb(26, 28, 30);">代码一致性</font>**<font style="color:rgb(26, 28, 30);">：整个应用使用同一套命名规范的 CSS 变量，更容易维护和理解。</font>
- **<font style="color:rgb(26, 28, 30);">减少冗余</font>**<font style="color:rgb(26, 28, 30);">：你可以删除掉你全局 CSS 文件里那些重复的</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">--color-background</font><font style="color:rgb(26, 28, 30);">、</font><font style="color:rgb(26, 28, 30);">--color-text</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">等变量，让</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">App.vue</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">的</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">watchEffect</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">成为唯一的颜色定义来源。</font>

### <font style="color:rgb(26, 28, 30);">关于路由缓存的解释</font>

<font style="color:rgb(26, 28, 30);">路由缓存（</font><font style="color:rgb(26, 28, 30);"><keep-alive></font><font style="color:rgb(26, 28, 30);">）通常不会影响 CSS 变量的生效。当</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">data-theme</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">属性在</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);"><html></font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">标签上改变时，浏览器会重新计算所有匹配该属性选择器的 CSS 规则，无论这些 DOM 元素是否在一个被缓存的组件内部。所以，你遇到的问题 99% 是 CSS 变量不一致导致的，而不是路由缓存。</font>

### <font style="color:rgb(26, 28, 30);">总结</font>

- **<font style="color:rgb(26, 28, 30);">问题根源</font>**<font style="color:rgb(26, 28, 30);">：在</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">App.vue</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">和</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">WebSocket.vue</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">中使用了两套不同的 CSS 变量名 (</font><font style="color:rgb(26, 28, 30);">--bg-color</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">vs</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">--color-background</font><font style="color:rgb(26, 28, 30);">) 来控制背景色。</font>
- **<font style="color:rgb(26, 28, 30);">解决方案</font>**<font style="color:rgb(26, 28, 30);">：统一变量。在你的</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">WebSocket.vue</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">组件中，将</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">var(--color-background)</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">修改为</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">var(--bg-color)</font><font style="color:rgb(26, 28, 30);">，将</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">var(--color-text)</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">修改为</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">var(--text-primary)</font><font style="color:rgb(26, 28, 30);">，以此类推，全面采用你在</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">App.vue</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">中通过 antd</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">token</font><font style="color:rgb(26, 28, 30);"> </font><font style="color:rgb(26, 28, 30);">生成的变量。</font>
- **<font style="color:rgb(26, 28, 30);">后续建议</font>**<font style="color:rgb(26, 28, 30);">：检查项目中的其他组件，确保它们也都使用 </font><font style="color:rgb(26, 28, 30);">App.vue</font><font style="color:rgb(26, 28, 30);"> 中定义的那套标准 CSS 变量，并可以考虑移除另一套静态的颜色变量定义，以避免未来的混淆。</font>
