import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import MainLayout from '../components/layout/MainLayout.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: '仪表盘' }
      },
      {
        path: 'commits',
        name: 'Commits',
        component: () => import('../views/CommitsView1.vue'),
        meta: { title: '提交记录' }
      },
      {
        path: 'analysis',
        name: 'CodeAnalysis',
        component: () => import('../views/CodeAnalysis.vue'),
        meta: { title: '代码分析' }
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('../views/Reports.vue'),
        meta: { title: '报告生成' }
      },
      {
        path: 'branches',
        name: 'BranchesView',
        component: () => import('../views/BranchesView.vue'),
        meta: { title: '分支管理' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/Settings.vue'),
        meta: { title: '设置' }
      },
      {
        path: 'scan',
        name: 'Scan',
        component: () => import('../views/BasicSettings.vue'),
        meta: { title: '开始扫描' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
