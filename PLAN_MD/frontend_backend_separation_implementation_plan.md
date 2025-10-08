# CognitoOcean 前后端分离实施计划（方案三：混合架构）

## 1. 总体实施策略

### 1.1 实施原则
- **最小改动原则**：在保持现有功能不变的前提下，逐步进行架构改造
- **渐进式改造**：分阶段实施，每个阶段都能独立运行和测试
- **向后兼容**：确保改造过程中的每个版本都能正常工作
- **风险可控**：每个阶段都有明确的回滚方案

### 1.2 实施目标
- 保持桌面应用形态和用户体验
- 实现前后端代码分离，提高可维护性
- 通过 HTTP API 替代 IPC 通信
- 为未来多客户端支持奠定基础

### 1.3 技术选型
- **Web 框架**：Express.js（轻量级，易于集成）
- **HTTP 客户端**：Axios（前端已有依赖）
- **认证方式**：JWT（无状态，易于扩展）
- **API 设计**：RESTful（标准化，易于理解）

## 2. 分阶段实施计划

### 阶段一：后端服务基础架构搭建（预计时间：3天）

#### 2.1 创建后端服务目录结构
**操作步骤**：
1. 在 `src` 目录下创建 `backend` 文件夹
2. 创建基础目录结构

**代码实现**：
```bash
# 在项目根目录执行
mkdir -p src/backend/{routes,controllers,services,models,middleware,utils,config}
```

#### 2.2 初始化后端服务
**操作步骤**：
1. 创建后端服务入口文件
2. 配置 Express 服务器
3. 集成到 Electron 主进程

**代码实现**：

创建 `src/backend/server.ts`：
```typescript
import express from 'express'
import cors from 'cors'
import { auditLogRoutes } from './routes/auditLog'
import { userRoutes } from './routes/user'
import { stockRoutes } from './routes/stock'
import { errorHandler } from './middleware/errorHandler'
import { authMiddleware } from './middleware/auth'

const app = express()
const PORT = process.env.BACKEND_PORT || 3001

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 路由
app.use('/api/audit-logs', authMiddleware, auditLogRoutes)
app.use('/api/users', userRoutes)
app.use('/api/stocks', authMiddleware, stockRoutes)

// 错误处理
app.use(errorHandler)

// 启动服务器
export function startBackendServer() {
  return app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`)
  })
}

export default app
```

创建 `src/backend/middleware/errorHandler.ts`：
```typescript
import { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  
  console.error(`Error ${statusCode}: ${message}`)
  console.error(err.stack)
  
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
}
```

创建 `src/backend/middleware/auth.ts`：
```typescript
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface AuthRequest extends Request {
  user?: {
    id: string
    username: string
  }
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.header('Authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    })
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    })
  }
}
```

#### 2.3 集成后端服务到 Electron 主进程
**操作步骤**：
1. 修改主进程入口文件
2. 启动后端服务

**代码实现**：

修改 `src/main/main.ts`，在 `whenReady` 函数中添加：
```typescript
// 在文件顶部添加导入
import { startBackendServer } from '../backend/server'

// 在 whenReady 函数中添加
export const whenReady = () => {
  // 原有代码...
  
  // 启动后端服务
  const backendServer = startBackendServer()
  console.log('Backend server started')
  
  // 原有代码...
}
```

#### 2.4 添加后端依赖
**操作步骤**：
1. 安装必要的后端依赖
2. 更新 package.json

**代码实现**：
```bash
# 在项目根目录执行
npm install express cors jsonwebtoken
npm install -D @types/express @types/cors @types/jsonwebtoken
```

### 阶段二：审计日志模块改造（预计时间：2天）

#### 2.1 创建审计日志后端 API
**操作步骤**：
1. 创建审计日志路由
2. 创建审计日志控制器
3. 创建审计日志服务
4. 创建审计日志模型

**代码实现**：

创建 `src/backend/routes/auditLog.ts`：
```typescript
import { Router } from 'express'
import { AuditLogController } from '../controllers/auditLog'

const router = Router()
const auditLogController = new AuditLogController()

// 获取审计日志列表（分页）
router.get('/', auditLogController.getAuditLogs)

// 删除审计日志
router.delete('/', auditLogController.deleteAuditLogs)

// 清除所有审计日志
router.delete('/all', auditLogController.clearAllAuditLogs)

export { router as auditLogRoutes }
```

创建 `src/backend/controllers/auditLog.ts`：
```typescript
import { Request, Response } from 'express'
import { AuditLogService } from '../services/auditLog'

export class AuditLogController {
  private auditLogService: AuditLogService

  constructor() {
    this.auditLogService = new AuditLogService()
  }

  getAuditLogs = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1
      const pageSize = parseInt(req.query.pageSize as string) || 10
      
      const result = await this.auditLogService.getAuditLogs(page, pageSize)
      
      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  deleteAuditLogs = async (req: Request, res: Response) => {
    try {
      const { ids } = req.body
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid IDs provided'
        })
      }
      
      const result = await this.auditLogService.deleteAuditLogs(ids)
      
      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  clearAllAuditLogs = async (req: Request, res: Response) => {
    try {
      const result = await this.auditLogService.clearAllAuditLogs()
      
      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}
```

创建 `src/backend/services/auditLog.ts`：
```typescript
import { dbHelper } from '../../main/features/database'

export interface AuditLog {
  id: number
  action: string
  target: string
  userId?: string
  timestamp: string
  details?: string
}

export class AuditLogService {
  private static readonly TABLE_NAME = 'audit_logs'

  async getAuditLogs(page: number, pageSize: number): Promise<{ records: AuditLog[]; total: number }> {
    try {
      const offset = (page - 1) * pageSize
      
      // 查询总记录数
      const countResult = dbHelper.query<{ total: number }>(
        `SELECT COUNT(*) as total FROM ${AuditLogService.TABLE_NAME}`
      )
      const total = countResult.length > 0 ? countResult[0].total : 0
      
      // 分页查询日志记录
      const records = dbHelper.query<AuditLog>(
        `SELECT * FROM ${AuditLogService.TABLE_NAME} ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
        [pageSize, offset]
      )
      
      return { records, total }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      throw new Error(`Failed to fetch audit logs: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async deleteAuditLogs(ids: number[]): Promise<{ changes: number }> {
    if (!ids || ids.length === 0) {
      return { changes: 0 }
    }

    try {
      const placeholders = ids.map(() => '?').join(', ')
      const sql = `DELETE FROM ${AuditLogService.TABLE_NAME} WHERE id IN (${placeholders})`
      
      const result = dbHelper.execute(sql, ids)
      return result
    } catch (error) {
      console.error('Error deleting audit logs:', error)
      throw new Error(`Failed to delete audit logs: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async clearAllAuditLogs(): Promise<{ changes: number }> {
    try {
      const result = await dbHelper.clearTable(AuditLogService.TABLE_NAME)
      return result
    } catch (error) {
      console.error('Error clearing audit logs:', error)
      throw new Error(`Failed to clear audit logs: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
```

#### 2.2 创建前端 API 客户端
**操作步骤**：
1. 创建 HTTP 客户端配置
2. 创建审计日志 API 客户端
3. 修改现有审计日志 API 调用

**代码实现**：

创建 `src/renderer/src/api/httpClient.ts`：
```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// 创建 axios 实例
const httpClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
httpClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      // 服务器返回错误
      console.error('API Error:', error.response.data)
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      console.error('Network Error:', error.message)
    } else {
      // 请求配置出错
      console.error('Request Error:', error.message)
    }
    return Promise.reject(error)
  }
)

export default httpClient
```

创建 `src/renderer/src/api/auditLogHttp.ts`：
```typescript
import httpClient from './httpClient'

export interface AuditLog {
  id: number
  action: string
  target: string
  userId?: string
  timestamp: string
  details?: string
}

export interface PaginatedResponse<T> {
  records: T[]
  total: number
}

/**
 * 分页获取审计日志
 * @param page - 当前页码
 * @param pageSize - 每页数量
 * @returns 日志数据和总数
 */
export const getAuditLogsHttpApi = (page: number, pageSize: number) => {
  return httpClient.get<PaginatedResponse<AuditLog>>('/audit-logs', {
    params: { page, pageSize }
  })
}

/**
 * 删除审计日志
 * @param ids - 要删除的日志 ID 数组
 * @returns 删除结果
 */
export const deleteAuditLogsHttpApi = (ids: number[]) => {
  return httpClient.delete<{ changes: number }>('/audit-logs', {
    data: { ids }
  })
}

/**
 * 清除所有审计日志
 * @returns 删除结果
 */
export const clearAuditLogsHttpApi = () => {
  return httpClient.delete<{ changes: number }>('/audit-logs/all')
}
```

#### 2.3 修改前端审计日志页面
**操作步骤**：
1. 修改 AuditLog.vue 页面
2. 添加 API 调用方式切换
3. 确保向后兼容

**代码实现**：

修改 `src/renderer/src/views/AuditLog.vue`（部分代码）：
```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { getAuditLogsApi, deleteAuditLogsApi, clearAuditLogsApi } from '@/api/auditLog'
import { getAuditLogsHttpApi, deleteAuditLogsHttpApi, clearAuditLogsHttpApi } from '@/api/auditLogHttp'

// 配置：使用 HTTP API 还是 IPC API
const USE_HTTP_API = true // 可以通过配置文件或环境变量控制

const dataSource = ref([])
const loading = ref(false)
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true
})

// 获取审计日志
const fetchAuditLogs = async () => {
  loading.value = true
  try {
    let result
    if (USE_HTTP_API) {
      const response = await getAuditLogsHttpApi(pagination.value.current, pagination.value.pageSize)
      result = response.data.data
    } else {
      result = await getAuditLogsApi(pagination.value.current, pagination.value.pageSize)
    }
    
    dataSource.value = result.records
    pagination.value.total = result.total
  } catch (error) {
    message.error('获取审计日志失败')
    console.error('Failed to fetch audit logs:', error)
  } finally {
    loading.value = false
  }
}

// 删除审计日志
const handleDelete = async (ids: number[]) => {
  try {
    let result
    if (USE_HTTP_API) {
      const response = await deleteAuditLogsHttpApi(ids)
      result = response.data.data
    } else {
      result = await deleteAuditLogsApi(ids)
    }
    
    if (result.changes > 0) {
      message.success('删除成功')
      fetchAuditLogs()
    } else {
      message.warning('未删除任何记录')
    }
  } catch (error) {
    message.error('删除失败')
    console.error('Failed to delete audit logs:', error)
  }
}

// 清除所有审计日志
const handleClearAll = async () => {
  try {
    let result
    if (USE_HTTP_API) {
      const response = await clearAuditLogsHttpApi()
      result = response.data.data
    } else {
      result = await clearAuditLogsApi()
    }
    
    if (result.changes > 0) {
      message.success('清除成功')
      dataSource.value = []
      pagination.value.total = 0
    } else {
      message.warning('没有可清除的记录')
    }
  } catch (error) {
    message.error('清除失败')
    console.error('Failed to clear audit logs:', error)
  }
}

// 其他代码保持不变...
</script>
```

### 阶段三：用户认证模块改造（预计时间：2天）

#### 3.1 创建用户认证后端 API
**操作步骤**：
1. 创建用户路由
2. 创建用户控制器
3. 创建用户服务
4. 创建用户模型

**代码实现**：

创建 `src/backend/routes/user.ts`：
```typescript
import { Router } from 'express'
import { UserController } from '../controllers/user'

const router = Router()
const userController = new UserController()

// 用户登录
router.post('/login', userController.login)

// 用户注册
router.post('/register', userController.register)

// 获取用户信息
router.get('/profile', userController.getProfile)

// 更新用户信息
router.put('/profile', userController.updateProfile)

export { router as userRoutes }
```

创建 `src/backend/controllers/user.ts`：
```typescript
import { Request, Response } from 'express'
import { UserService } from '../services/user'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export class UserController {
  private userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  login = async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body
      
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        })
      }
      
      const user = await this.userService.authenticateUser(username, password)
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        })
      }
      
      // 生成 JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      )
      
      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          },
          token
        }
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  register = async (req: Request, res: Response) => {
    try {
      const { username, password, email } = req.body
      
      if (!username || !password || !email) {
        return res.status(400).json({
          success: false,
          message: 'Username, password and email are required'
        })
      }
      
      const user = await this.userService.createUser({ username, password, email })
      
      // 生成 JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      )
      
      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          },
          token
        }
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  getProfile = async (req: Request, res: Response) => {
    try {
      // 从认证中间件获取用户信息
      const userId = (req as any).user.id
      
      const user = await this.userService.getUserById(userId)
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }
      
      res.json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt
        }
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  updateProfile = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id
      const { email } = req.body
      
      const user = await this.userService.updateUser(userId, { email })
      
      res.json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          updatedAt: user.updatedAt
        }
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}
```

创建 `src/backend/services/user.ts`：
```typescript
import { dbHelper } from '../../main/features/database'
import bcrypt from 'bcryptjs'

export interface User {
  id: number
  username: string
  email: string
  password: string
  createdAt: string
  updatedAt: string
}

export class UserService {
  private static readonly TABLE_NAME = 'users'
  private static readonly SALT_ROUNDS = 10

  async authenticateUser(username: string, password: string): Promise<User | null> {
    try {
      const users = dbHelper.query<User>(
        `SELECT * FROM ${UserService.TABLE_NAME} WHERE username = ?`,
        [username]
      )
      
      if (users.length === 0) {
        return null
      }
      
      const user = users[0]
      
      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password)
      
      if (!isPasswordValid) {
        return null
      }
      
      return user
    } catch (error) {
      console.error('Error authenticating user:', error)
      throw new Error(`Failed to authenticate user: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async createUser(userData: { username: string; password: string; email: string }): Promise<User> {
    try {
      // 检查用户名是否已存在
      const existingUsers = dbHelper.query<User>(
        `SELECT id FROM ${UserService.TABLE_NAME} WHERE username = ?`,
        [userData.username]
      )
      
      if (existingUsers.length > 0) {
        throw new Error('Username already exists')
      }
      
      // 哈希密码
      const hashedPassword = await bcrypt.hash(userData.password, UserService.SALT_ROUNDS)
      
      // 创建用户
      const result = dbHelper.execute(
        `INSERT INTO ${UserService.TABLE_NAME} (username, email, password, createdAt, updatedAt) 
         VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
        [userData.username, userData.email, hashedPassword]
      )
      
      // 获取新创建的用户
      const newUsers = dbHelper.query<User>(
        `SELECT * FROM ${UserService.TABLE_NAME} WHERE id = ?`,
        [result.lastInsertRowid]
      )
      
      return newUsers[0]
    } catch (error) {
      console.error('Error creating user:', error)
      throw new Error(`Failed to create user: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async getUserById(id: number): Promise<User | null> {
    try {
      const users = dbHelper.query<User>(
        `SELECT id, username, email, createdAt, updatedAt FROM ${UserService.TABLE_NAME} WHERE id = ?`,
        [id]
      )
      
      return users.length > 0 ? users[0] : null
    } catch (error) {
      console.error('Error getting user by ID:', error)
      throw new Error(`Failed to get user: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async updateUser(id: number, updateData: { email?: string }): Promise<User> {
    try {
      const updateFields = []
      const updateValues = []
      
      if (updateData.email) {
        updateFields.push('email = ?')
        updateValues.push(updateData.email)
      }
      
      if (updateFields.length === 0) {
        throw new Error('No fields to update')
      }
      
      updateFields.push('updatedAt = datetime("now")')
      updateValues.push(id)
      
      dbHelper.execute(
        `UPDATE ${UserService.TABLE_NAME} SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      )
      
      const updatedUsers = dbHelper.query<User>(
        `SELECT id, username, email, createdAt, updatedAt FROM ${UserService.TABLE_NAME} WHERE id = ?`,
        [id]
      )
      
      return updatedUsers[0]
    } catch (error) {
      console.error('Error updating user:', error)
      throw new Error(`Failed to update user: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
```

#### 3.2 创建前端用户认证 API 客户端
**操作步骤**：
1. 创建用户认证 API 客户端
2. 添加认证状态管理
3. 修改登录页面

**代码实现**：

创建 `src/renderer/src/api/userHttp.ts`：
```typescript
import httpClient from './httpClient'

export interface User {
  id: number
  username: string
  email: string
  createdAt?: string
  updatedAt?: string
}

export interface LoginResponse {
  user: User
  token: string
}

/**
 * 用户登录
 * @param username - 用户名
 * @param password - 密码
 * @returns 登录结果
 */
export const loginHttpApi = (username: string, password: string) => {
  return httpClient.post<LoginResponse>('/users/login', { username, password })
}

/**
 * 用户注册
 * @param username - 用户名
 * @param password - 密码
 * @param email - 邮箱
 * @returns 注册结果
 */
export const registerHttpApi = (username: string, password: string, email: string) => {
  return httpClient.post<LoginResponse>('/users/register', { username, password, email })
}

/**
 * 获取用户信息
 * @returns 用户信息
 */
export const getUserProfileHttpApi = () => {
  return httpClient.get<{ user: User }>('/users/profile')
}

/**
 * 更新用户信息
 * @param email - 邮箱
 * @returns 更新后的用户信息
 */
export const updateUserProfileHttpApi = (email: string) => {
  return httpClient.put<{ user: User }>('/users/profile', { email })
}
```

创建 `src/renderer/src/stores/authStore.ts`：
```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loginHttpApi, registerHttpApi, getUserProfileHttpApi, updateUserProfileHttpApi } from '@/api/userHttp'
import type { User } from '@/api/userHttp'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)

  // 计算属性：是否已登录
  const isLoggedIn = computed(() => !!token.value)

  // 初始化认证状态
  const initAuth = async () => {
    if (!token.value) return
    
    try {
      loading.value = true
      const response = await getUserProfileHttpApi()
      user.value = response.data.data.user
    } catch (error) {
      // Token 无效，清除本地存储
      logout()
    } finally {
      loading.value = false
    }
  }

  // 登录
  const login = async (username: string, password: string) => {
    try {
      loading.value = true
      const response = await loginHttpApi(username, password)
      
      const { user: userData, token: userToken } = response.data.data
      
      user.value = userData
      token.value = userToken
      
      // 保存 token 到本地存储
      localStorage.setItem('token', userToken)
      
      return { success: true }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    } finally {
      loading.value = false
    }
  }

  // 注册
  const register = async (username: string, password: string, email: string) => {
    try {
      loading.value = true
      const response = await registerHttpApi(username, password, email)
      
      const { user: userData, token: userToken } = response.data.data
      
      user.value = userData
      token.value = userToken
      
      // 保存 token 到本地存储
      localStorage.setItem('token', userToken)
      
      return { success: true }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      }
    } finally {
      loading.value = false
    }
  }

  // 更新用户信息
  const updateProfile = async (email: string) => {
    try {
      loading.value = true
      const response = await updateUserProfileHttpApi(email)
      
      user.value = response.data.data.user
      
      return { success: true }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Update failed' 
      }
    } finally {
      loading.value = false
    }
  }

  // 登出
  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  return {
    user,
    token,
    loading,
    isLoggedIn,
    initAuth,
    login,
    register,
    updateProfile,
    logout
  }
})
```

#### 3.3 修改登录页面
**操作步骤**：
1. 修改登录页面组件
2. 集成认证状态管理
3. 添加 API 调用方式切换

**代码实现**：

修改 `src/renderer/src/views/Login.vue`（部分代码）：
```vue
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/authStore'
import { loginHttpApi } from '@/api/userHttp'

// 配置：使用 HTTP API 还是 IPC API
const USE_HTTP_API = true // 可以通过配置文件或环境变量控制

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: '',
  remember: false
})

const loading = ref(false)

const handleLogin = async () => {
  if (!form.username || !form.password) {
    message.warning('请输入用户名和密码')
    return
  }

  loading.value = true
  try {
    let result
    
    if (USE_HTTP_API) {
      const response = await loginHttpApi(form.username, form.password)
      const { user, token } = response.data.data
      
      // 更新认证状态
      authStore.user = user
      authStore.token = token
      
      // 保存 token 到本地存储
      localStorage.setItem('token', token)
      
      result = { success: true }
    } else {
      // 使用原有的 IPC API
      // result = await window.api.login(form.username, form.password)
      result = { success: true } // 临时模拟
    }
    
    if (result.success) {
      message.success('登录成功')
      router.push('/')
    } else {
      message.error(result.message || '登录失败')
    }
  } catch (error: any) {
    console.error('Login error:', error)
    message.error(error.response?.data?.message || '登录失败')
  } finally {
    loading.value = false
  }
}

// 其他代码保持不变...
</script>
```

### 阶段四：其他模块改造（预计时间：5天）

#### 4.1 股票模块改造
**操作步骤**：
1. 创建股票后端 API
2. 创建股票前端 API 客户端
3. 修改股票相关页面

**代码实现**：

创建 `src/backend/routes/stock.ts`：
```typescript
import { Router } from 'express'
import { StockController } from '../controllers/stock'

const router = Router()
const stockController = new StockController()

// 搜索股票
router.get('/search', stockController.searchStocks)

// 获取股票信息
router.get('/:code', stockController.getStockInfo)

// 获取股票新闻
router.get('/:code/news', stockController.getStockNews)

// 其他股票相关路由...

export { router as stockRoutes }
```

创建 `src/backend/controllers/stock.ts`：
```typescript
import { Request, Response } from 'express'
import { StockService } from '../services/stock'

export class StockController {
  private stockService: StockService

  constructor() {
    this.stockService = new StockService()
  }

  searchStocks = async (req: Request, res: Response) => {
    try {
      const { q } = req.query
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        })
      }
      
      const results = await this.stockService.searchStocks(q)
      
      res.json({
        success: true,
        data: results
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  getStockInfo = async (req: Request, res: Response) => {
    try {
      const { code } = req.params
      
      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Stock code is required'
        })
      }
      
      const stockInfo = await this.stockService.getStockInfoByCode(code)
      
      if (!stockInfo) {
        return res.status(404).json({
          success: false,
          message: 'Stock not found'
        })
      }
      
      res.json({
        success: true,
        data: stockInfo
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  getStockNews = async (req: Request, res: Response) => {
    try {
      const { code } = req.params
      
      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Stock code is required'
        })
      }
      
      const news = await this.stockService.getStockNews(code)
      
      res.json({
        success: true,
        data: news
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}
```

创建 `src/backend/services/stock.ts`：
```typescript
import { stockService as ipcStockService } from '../../main/features/services/stock'

export interface Stock {
  code: string
  name: string
  price?: number
  change?: number
  changePercent?: number
  volume?: number
  marketCap?: number
}

export interface StockNews {
  id: string
  title: string
  content: string
  publishTime: string
  source: string
}

export class StockService {
  async searchStocks(query: string): Promise<Stock[]> {
    try {
      // 复用现有的 IPC 服务逻辑
      const results = await ipcStockService.searchStocks(query)
      return results
    } catch (error) {
      console.error('Error searching stocks:', error)
      throw new Error(`Failed to search stocks: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async getStockInfoByCode(code: string): Promise<Stock | null> {
    try {
      // 复用现有的 IPC 服务逻辑
      const stockInfo = await ipcStockService.getStockInfoByCode(code)
      return stockInfo
    } catch (error) {
      console.error('Error getting stock info:', error)
      throw new Error(`Failed to get stock info: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async getStockNews(code: string): Promise<StockNews[]> {
    try {
      // 复用现有的 IPC 服务逻辑
      const news = await ipcStockService.getStockNews(code)
      return news
    } catch (error) {
      console.error('Error getting stock news:', error)
      throw new Error(`Failed to get stock news: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
```

创建 `src/renderer/src/api/stockHttp.ts`：
```typescript
import httpClient from './httpClient'
import type { Stock, StockNews } from '@/api/stockHttp'

/**
 * 搜索股票
 * @param query - 搜索关键词
 * @returns 股票列表
 */
export const searchStocksHttpApi = (query: string) => {
  return httpClient.get<Stock[]>('/stocks/search', {
    params: { q: query }
  })
}

/**
 * 获取股票信息
 * @param code - 股票代码
 * @returns 股票信息
 */
export const getStockInfoHttpApi = (code: string) => {
  return httpClient.get<Stock>(`/stocks/${code}`)
}

/**
 * 获取股票新闻
 * @param code - 股票代码
 * @returns 股票新闻列表
 */
export const getStockNewsHttpApi = (code: string) => {
  return httpClient.get<StockNews[]>(`/stocks/${code}/news`)
}
```

#### 4.2 其他模块改造
按照类似的方式，逐步改造其他模块，包括：
- 文件系统模块
- Git 模块
- AI 聊天模块
- 设置模块
- 系统工具模块
- WebSocket 通信模块

### 阶段五：测试与优化（预计时间：2天）

#### 5.1 单元测试
**操作步骤**：
1. 为后端 API 添加单元测试
2. 为前端 API 客户端添加单元测试
3. 确保测试覆盖率

**代码实现**：

创建 `src/backend/tests/auditLog.test.ts`：
```typescript
import request from 'supertest'
import app from '../server'
import { auditLogService } from '../services/auditLog'

// 模拟审计日志服务
jest.mock('../services/auditLog')
const mockedAuditLogService = auditLogService as jest.Mocked<typeof auditLogService>

describe('Audit Log API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/audit-logs', () => {
    it('should return audit logs with pagination', async () => {
      const mockLogs = {
        records: [
          { id: 1, action: 'test', target: 'test', timestamp: '2023-01-01' }
        ],
        total: 1
      }
      
      mockedAuditLogService.getAuditLogs.mockResolvedValue(mockLogs)
      
      const response = await request(app)
        .get('/api/audit-logs?page=1&pageSize=10')
        .expect(200)
      
      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockLogs)
      expect(mockedAuditLogService.getAuditLogs).toHaveBeenCalledWith(1, 10)
    })
  })

  describe('DELETE /api/audit-logs', () => {
    it('should delete audit logs', async () => {
      const mockResult = { changes: 1 }
      mockedAuditLogService.deleteAuditLogs.mockResolvedValue(mockResult)
      
      const response = await request(app)
        .delete('/api/audit-logs')
        .send({ ids: [1, 2, 3] })
        .expect(200)
      
      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockResult)
      expect(mockedAuditLogService.deleteAuditLogs).toHaveBeenCalledWith([1, 2, 3])
    })
  })

  describe('DELETE /api/audit-logs/all', () => {
    it('should clear all audit logs', async () => {
      const mockResult = { changes: 5 }
      mockedAuditLogService.clearAllAuditLogs.mockResolvedValue(mockResult)
      
      const response = await request(app)
        .delete('/api/audit-logs/all')
        .expect(200)
      
      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual(mockResult)
      expect(mockedAuditLogService.clearAllAuditLogs).toHaveBeenCalled()
    })
  })
})
```

#### 5.2 集成测试
**操作步骤**：
1. 测试前后端集成
2. 测试认证流程
3. 测试错误处理

#### 5.3 性能优化
**操作步骤**：
1. 添加请求缓存
2. 优化数据库查询
3. 添加请求限流

**代码实现**：

创建 `src/backend/middleware/rateLimit.ts`：
```typescript
import { Request, Response, NextFunction } from 'express'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export function rateLimit(windowMs: number, maxRequests: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || req.connection.remoteAddress || 'unknown'
    const now = Date.now()
    
    // 清除过期的记录
    if (store[clientId] && store[clientId].resetTime < now) {
      delete store[clientId]
    }
    
    // 初始化或更新计数器
    if (!store[clientId]) {
      store[clientId] = {
        count: 1,
        resetTime: now + windowMs
      }
    } else {
      store[clientId].count++
    }
    
    // 检查是否超过限制
    if (store[clientId].count > maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later'
      })
    }
    
    next()
  }
}
```

### 阶段六：部署与发布（预计时间：1天）

#### 6.1 构建配置
**操作步骤**：
1. 更新构建脚本
2. 配置环境变量
3. 优化打包大小

**代码实现**：

修改 `package.json`，添加新的构建脚本：
```json
{
  "scripts": {
    "build:backend": "tsc -p tsconfig.backend.json",
    "start:backend": "node dist/backend/server.js",
    "dev:backend": "ts-node src/backend/server.ts"
  }
}
```

创建 `tsconfig.backend.json`：
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist/backend",
    "rootDir": "./src/backend",
    "module": "commonjs",
    "target": "ES2020",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": [
    "src/backend/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

#### 6.2 环境配置
**操作步骤**：
1. 创建环境配置文件
2. 配置不同环境的参数

**代码实现**：

创建 `.env` 文件：
```
# Backend server configuration
BACKEND_PORT=3001
NODE_ENV=development

# JWT configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# Database configuration
DB_TYPE=sqlite
DB_PATH=./data/database.sqlite
```

创建 `.env.production` 文件：
```
# Backend server configuration
BACKEND_PORT=3001
NODE_ENV=production

# JWT configuration
JWT_SECRET=your-production-secret-key
JWT_EXPIRES_IN=24h

# Database configuration
DB_TYPE=sqlite
DB_PATH=./data/database.sqlite
```

#### 6.3 文档更新
**操作步骤**：
1. 更新 API 文档
2. 更新部署文档
3. 更新开发指南

## 3. 风险控制与回滚方案

### 3.1 风险控制
1. **功能开关**：通过配置控制使用新 API 还是旧 API
2. **渐进式发布**：先在开发环境测试，再在测试环境验证，最后在生产环境发布
3. **监控告警**：添加错误监控和性能监控

### 3.2 回滚方案
1. **快速回滚**：通过配置切换回旧 API
2. **代码回滚**：使用版本控制系统回滚代码
3. **数据回滚**：保留数据备份，必要时恢复

### 3.3 应急预案
1. **服务降级**：当后端服务不可用时，自动降级到本地模式
2. **错误重试**：实现请求重试机制
3. **离线模式**：支持离线操作，数据同步

## 4. 总结

本实施计划详细描述了如何按照方案三（混合架构）对 CognitoOcean 项目进行前后端分离改造。通过分阶段实施，每个阶段都能独立运行和测试，确保改造过程的可控性和稳定性。

实施过程中，我们遵循最小改动原则，在保持现有功能不变的前提下，逐步进行架构改造。通过向后兼容的设计，确保改造过程中的每个版本都能正常工作。

通过这个实施计划，CognitoOcean 项目将实现前后端分离，提高代码的可维护性和可扩展性，为未来多客户端支持奠定基础。