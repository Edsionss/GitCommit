<template>
  <div class="settings-container page-container">
    <h2 class="page-title">设置</h2>

    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>外观设置</span>
        </div>
      </template>

      <div class="settings-section">
        <div class="setting-item">
          <div class="setting-label">
            <el-icon><Brush /></el-icon>
            <span>主题设置</span>
          </div>
          <div class="setting-control">
            <el-radio-group v-model="settings.appearance.theme" @change="updateTheme">
              <el-radio-button :value="'light'">浅色</el-radio-button>
              <el-radio-button :value="'dark'">深色</el-radio-button>
              <el-radio-button :value="'system'">跟随系统</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <el-icon><Menu /></el-icon>
            <span>侧边栏位置</span>
          </div>
          <div class="setting-control">
            <el-radio-group v-model="settings.appearance.sidebarPosition">
              <el-radio-button :value="'left'">左侧</el-radio-button>
              <el-radio-button :value="'right'">右侧</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <el-icon><ZoomIn /></el-icon>
            <span>界面缩放</span>
          </div>
          <div class="setting-control">
            <el-select v-model="settings.appearance.zoom">
              <el-option label="80%" value="0.8" />
              <el-option label="90%" value="0.9" />
              <el-option label="100%" value="1" />
              <el-option label="110%" value="1.1" />
              <el-option label="120%" value="1.2" />
            </el-select>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <el-icon><Operation /></el-icon>
            <span>动画效果</span>
          </div>
          <div class="setting-control">
            <el-switch
              v-model="settings.appearance.animations"
              active-text="启用"
              inactive-text="禁用"
            />
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>语言和地区</span>
        </div>
      </template>

      <div class="settings-section">
        <div class="setting-item">
          <div class="setting-label">
            <el-icon><ChatLineRound /></el-icon>
            <span>界面语言</span>
          </div>
          <div class="setting-control">
            <el-select v-model="settings.locale.language">
              <el-option label="简体中文" value="zh-CN" />
              <el-option label="English" value="en-US" />
              <el-option label="日本語" value="ja-JP" />
              <el-option label="한국어" value="ko-KR" />
            </el-select>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <el-icon><Calendar /></el-icon>
            <span>日期格式</span>
          </div>
          <div class="setting-control">
            <el-select v-model="settings.locale.dateFormat">
              <el-option label="YYYY-MM-DD" value="YYYY-MM-DD" />
              <el-option label="MM/DD/YYYY" value="MM/DD/YYYY" />
              <el-option label="DD/MM/YYYY" value="DD/MM/YYYY" />
              <el-option label="YYYY年MM月DD日" value="YYYY年MM月DD日" />
            </el-select>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <el-icon><Timer /></el-icon>
            <span>时间格式</span>
          </div>
          <div class="setting-control">
            <el-radio-group v-model="settings.locale.timeFormat">
              <el-radio-button :value="'24'">24小时制</el-radio-button>
              <el-radio-button :value="'12'">12小时制</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>Git 设置</span>
        </div>
      </template>

      <div class="settings-section">
        <div class="setting-item">
          <div class="setting-label">
            <el-icon><UserFilled /></el-icon>
            <span>默认作者</span>
          </div>
          <div class="setting-control">
            <el-input v-model="settings.git.defaultAuthor" placeholder="输入默认作者名称" />
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <el-icon><Message /></el-icon>
            <span>默认邮箱</span>
          </div>
          <div class="setting-control">
            <el-input v-model="settings.git.defaultEmail" placeholder="输入默认邮箱地址" />
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <el-icon><FolderOpened /></el-icon>
            <span>仓库扫描路径</span>
          </div>
          <div class="setting-control">
            <el-input v-model="settings.git.repositoryPath" placeholder="输入默认仓库扫描路径">
              <template #append>
                <el-button @click="selectDirectory">
                  <el-icon><FolderAdd /></el-icon>
                </el-button>
              </template>
            </el-input>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <el-icon><RefreshRight /></el-icon>
            <span>自动刷新时间间隔</span>
          </div>
          <div class="setting-control">
            <el-select v-model="settings.git.refreshInterval">
              <el-option label="禁用" value="0" />
              <el-option label="1分钟" value="60000" />
              <el-option label="5分钟" value="300000" />
              <el-option label="10分钟" value="600000" />
              <el-option label="30分钟" value="1800000" />
            </el-select>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
        </div>
      </template>

      <div class="settings-section">
        <div class="setting-item">
          <div class="setting-label">
            <el-icon><Switch /></el-icon>
            <span>开机自启</span>
          </div>
          <div class="setting-control">
            <el-switch
              v-model="settings.system.startWithSystem"
              active-text="启用"
              inactive-text="禁用"
            />
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <el-icon><Bell /></el-icon>
            <span>通知提醒</span>
          </div>
          <div class="setting-control">
            <el-switch
              v-model="settings.system.notifications"
              active-text="启用"
              inactive-text="禁用"
            />
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <el-icon><Download /></el-icon>
            <span>自动更新</span>
          </div>
          <div class="setting-control">
            <el-switch
              v-model="settings.system.autoUpdate"
              active-text="启用"
              inactive-text="禁用"
            />
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <el-icon><DataLine /></el-icon>
            <span>数据统计</span>
          </div>
          <div class="setting-control">
            <el-switch
              v-model="settings.system.telemetry"
              active-text="允许收集匿名统计数据"
              inactive-text="禁用"
            />
          </div>
        </div>
      </div>
    </el-card>

    <div class="settings-actions">
      <el-button type="primary" @click="saveSettings">保存设置</el-button>
      <el-button @click="resetSettings">重置设置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  Brush,
  Menu,
  ZoomIn,
  Operation,
  ChatLineRound,
  Calendar,
  Timer,
  UserFilled,
  Message,
  FolderOpened,
  FolderAdd,
  RefreshRight,
  Switch,
  Bell,
  Download,
  DataLine
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTheme } from '../composables/useTheme'

// 使用主题组合式函数
const { setThemeMode, currentTheme } = useTheme()

// 设置状态
const settings = reactive({
  appearance: {
    theme: 'light',
    sidebarPosition: 'left',
    zoom: '1',
    animations: true
  },
  locale: {
    language: 'zh-CN',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24'
  },
  git: {
    defaultAuthor: '',
    defaultEmail: '',
    repositoryPath: '',
    refreshInterval: '300000'
  },
  system: {
    startWithSystem: false,
    notifications: true,
    autoUpdate: true,
    telemetry: true
  }
})

// 读取设置
const loadSettings = () => {
  // 先读取主题模式以确保UI状态与存储一致
  const savedThemeMode = localStorage.getItem('themeMode') || 'light'
  settings.appearance.theme = savedThemeMode

  const savedSettings = localStorage.getItem('appSettings')
  if (savedSettings) {
    try {
      const parsedSettings = JSON.parse(savedSettings)

      // 合并设置以保留新增的设置项
      Object.keys(settings).forEach((category) => {
        if (parsedSettings[category]) {
          Object.keys(settings[category]).forEach((key) => {
            if (parsedSettings[category][key] !== undefined) {
              settings[category][key] = parsedSettings[category][key]
            }
          })
        }
      })

      // 确保主题设置始终优先使用themeMode而不是从appSettings读取
      settings.appearance.theme = savedThemeMode

      ElMessage.success('设置已加载')
    } catch (error) {
      console.error('Failed to parse settings:', error)
      ElMessage.error('设置加载失败')
    }
  }
}

// 保存设置
const saveSettings = () => {
  localStorage.setItem('appSettings', JSON.stringify(settings))
  ElMessage.success('设置已保存')
}

// 重置设置
const resetSettings = () => {
  ElMessageBox.confirm('确定要重置所有设置到默认值吗？此操作不可撤销。', '重置设置', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      settings.appearance.theme = 'light'
      settings.appearance.sidebarPosition = 'left'
      settings.appearance.zoom = '1'
      settings.appearance.animations = true

      settings.locale.language = 'zh-CN'
      settings.locale.dateFormat = 'YYYY-MM-DD'
      settings.locale.timeFormat = '24'

      settings.git.defaultAuthor = ''
      settings.git.defaultEmail = ''
      settings.git.repositoryPath = ''
      settings.git.refreshInterval = '300000'

      settings.system.startWithSystem = false
      settings.system.notifications = true
      settings.system.autoUpdate = true
      settings.system.telemetry = true

      // 应用默认主题
      updateTheme('light')

      // 保存默认设置
      saveSettings()

      ElMessage.success('设置已重置为默认值')
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 更新主题
const updateTheme = (theme: string) => {
  console.log('设置页面更新主题:', theme)
  setThemeMode(theme as 'light' | 'dark' | 'system')
}

// 选择目录
const selectDirectory = async () => {
  // 这里应该用Electron的dialog选择目录
  // 以下是模拟效果
  setTimeout(() => {
    settings.git.repositoryPath = 'D:\\Projects\\GitRepositories'
    ElMessage.success('已选择目录：' + settings.git.repositoryPath)
  }, 500)
}

// 组件挂载时加载设置
onMounted(() => {
  loadSettings()

  // 读取当前主题设置，确保UI正确显示
  const themeMode = localStorage.getItem('themeMode') || 'light'
  settings.appearance.theme = themeMode
  console.log('设置页面加载时的主题模式:', themeMode)
})
</script>

<style scoped>
.settings-container {
  width: 100%;
  padding-bottom: 30px;
  padding-top: 20px; /* 添加顶部内边距 */
}

.page-title {
  margin: 0 0 20px 0;
  font-size: var(--font-size-xl);
  color: var(--color-text); /* 修改为正确的CSS变量 */
  font-weight: var(--font-weight-semibold);
}

.settings-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-md);
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text); /* 修改为正确的CSS变量 */
  font-weight: var(--font-weight-medium);
}

.setting-control {
  min-width: 200px;
}

.settings-actions {
  display: flex;
  gap: 12px;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .setting-control {
    width: 100%;
  }
}
</style>
