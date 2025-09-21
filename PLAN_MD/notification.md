```javascript
// 这个函数在你的渲染进程代码中（例如 Vue/React 组件里）

function showNotificationWithSound() {
  // 1. 定义通知的标题
  const title = '新消息'

  // 2. 定义通知的选项对象
  const options = {
    body: '您有一条新的任务提醒！'
    // icon: '/path/to/icon.png', // 你还可以指定一个图标
    // silent: false, // 默认就是 false，会播放声音
  }

  // 3. 使用【全局可用】的 `Notification` 构造函数来【创建】一个通知实例
  //    `new Notification(...)` 这个操作就像 `new Audio(...)` 或 `new Date()`
  const myNotification = new Notification(title, options)
  //   ^--------------------^
  //   这里的 `myNotification` 只是一个变量，用来接收创建好的通知对象，
  //   以便我们后续可以对这个特定的通知进行操作（比如添加点击事件）。

  // 4. (可选) 为这个通知实例添加一个点击事件监听器
  myNotification.onclick = () => {
    console.log('通知被点击了')
    // 在这里可以执行一些操作，比如切换到对应的应用窗口
    // window.electron.ipcRenderer.send('focus-window');
  }
}

// 在需要的时候调用这个函数
// showNotificationWithSound();
```
