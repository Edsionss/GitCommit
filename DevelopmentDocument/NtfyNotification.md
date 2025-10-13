# Ntfy消息推送功能开发设计文档

## 功能概述
开发一个基于ntfy.sh的消息推送功能，允许应用程序向指定的ntfy主题发送通知消息。用户可以配置自定义主题和消息内容，实现灵活的消息推送服务。

## 技术方案
1. 使用axios替换fetch进行HTTP请求
2. 在主进程中实现消息推送服务
3. 通过IPC通道暴露给渲染进程调用
4. 支持自定义主题和消息内容
5. 提供消息推送历史记录功能

## 依赖项
- axios (已安装)
- 无需额外安装NPM包

## 数据库设计
1. **notification_logs表**: 记录所有推送消息的历史
   - id: 主键
   - topic: 推送主题
   - message: 推送消息内容
   - status: 推送状态 (success/failed)
   - error_message: 错误信息(如果有)
   - created_at: 创建时间

## API设计
1. **IPC通道名称**: `ntfy:sendMessage`
2. **数据传输对象(DTO)**:
   ```typescript
   interface NtfyMessageRequest {
     topic: string;
     message: string;
   }
   
   interface NtfyMessageResponse {
     success: boolean;
     message?: string;
     error?: string;
   }
   
   interface NotificationLog {
     id: number;
     topic: string;
     message: string;
     status: 'success' | 'failed';
     error_message?: string;
     created_at: string;
   }
   ```

## 模块划分
1. **Service层**: `/src/main/features/services/NtfyNotification/index.ts`
   - 处理消息推送逻辑
   - 记录推送历史
   
2. **Handler层**: `/src/main/features/handlers/NtfyNotification/index.ts`
   - 定义IPC通信接口
   - 调用Service层方法
   
3. **前端API**: `/src/renderer/src/api/ntfyNotification.ts`
   - 封装对Preload脚本的调用
   
4. **UI组件**: `/src/renderer/src/views/NtfyNotification.vue`
   - 提供消息推送界面
   - 显示推送历史记录

5. **类型定义**: `/src/shared/types/dtos/NtfyNotification.ts`
   - 定义所有相关数据类型