import { ref, watch, reactive, computed, ToRefs } from 'vue'
import { message } from 'ant-design-vue'
import { gitService } from '@services/GitService'
import dayjs, { Dayjs } from 'dayjs'

interface FormState {
  repoPath: string
  scanSubfolders: boolean
  selectedRepos: string[]
  branches: string[]
  authorFilter: string[]
  dateRange: [Dayjs, Dayjs]
  [key: string]: any
}

interface SubRepo {
  name: string
  path: string
}

export function useSettingsForm(
  localForm: FormState,
  repoStatus: ToRefs<{ value: 'valid' | 'invalid' | 'warning' | 'none' }>,
  emit: (event: string, ...args: any[]) => void
) {
  const PRESET_RANGES: { [key: string]: [Dayjs, Dayjs] | string } = {
    今日: [dayjs().startOf('day'), dayjs().endOf('day')],
    本周: [dayjs().startOf('week'), dayjs().endOf('week')],
    本月: [dayjs().startOf('month'), dayjs().endOf('month')],
    自定义: 'custom'
  }

  const subRepos = ref<SubRepo[]>([])
  const isDiscoveringRepos = ref(false)
  const repoHistory = ref(gitService.getRepoHistory())
  const availableAuthors = ref<string[]>([])
  const authorsLoading = ref(false)
  const branchesLoading = ref(false)
  const availableBranches = ref<string[]>([])
  const datePreset = ref('本月')
  const isSelectingPath = ref(false)

  const isScanAuthorDisabled = computed(() => {
    if (localForm.scanSubfolders) {
      return localForm.selectedRepos.length === 0
    }
    return repoStatus.value !== 'valid'
  })

  watch(
    () => localForm.scanSubfolders,
    (newVal) => {
      localForm.selectedRepos = []
      subRepos.value = []
      availableBranches.value = []
      localForm.branches = []
      availableAuthors.value = []
      localForm.authorFilter = []

      if (newVal) {
        emit('update:repoStatus', 'warning')
        emit('add-log', '多个仓库不支持选择分支，请清除分支选择', 'info')
      } else {
        emit('update:repoStatus', 'none')
        if (localForm.repoPath) {
          emit('validate-repo-path', localForm.repoPath)
        }
      }
    }
  )

  watch(repoStatus, (newStatus) => {
    availableBranches.value = []
    localForm.branches = []
    if (newStatus === 'valid') {
      message.success('验证成功，是有效的Git仓库')
      emit('add-log', `选择并验证仓库: ${localForm.repoPath} 有效`, 'success')
      if (!localForm.scanSubfolders) {
        localForm.selectedRepos = [localForm.repoPath]
      }
      loadBranches()
      loadAuthors()
    } else if (newStatus === 'invalid') {
      if (localForm.repoPath && !localForm.scanSubfolders) {
        message.error('验证失败，当前路径不是有效的Git仓库')
        emit(
          'add-log',
          `选择并验证仓库: ${localForm.repoPath} 无效，请尝试开启自动扫描子文件夹。`,
          'error'
        )
      }
    } else if (newStatus === 'warning') {
      emit('add-log', `已切换到多仓库扫描模式，请在下方选择要扫描的仓库`, 'info')
    }
  })

  const loadBranches = async () => {
    if (repoStatus.value !== 'valid') return
    branchesLoading.value = true
    try {
      emit('add-log', `加载分支列表: ${localForm.repoPath}`, 'info')
      const branches = await window.api.getRepoBranches(localForm.repoPath)
      availableBranches.value = branches
      if (branches.length > 0) {
        emit('add-log', `成功加载 ${branches.length} 个分支`, 'success')
      } else {
        emit('add-log', '未找到任何分支', 'info')
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      emit('add-log', `加载分支失败: ${msg}`, 'error')
      message.error(`加载分支失败: ${msg}`)
    } finally {
      branchesLoading.value = false
    }
  }

  const clearRepoPath = () => {
    localForm.repoPath = ''
    emit('validate-repo-path', '')
    availableAuthors.value = []
    localForm.authorFilter = []
    subRepos.value = []
    localForm.selectedRepos = []
  }

  const selectRepoPath = async () => {
    isSelectingPath.value = true
    try {
      const result = await window.api.selectDirectory()
      if (result) {
        const { path } = result
        localForm.repoPath = path
        emit('validate-repo-path', path)
        gitService.addToHistory(path)
        repoHistory.value = gitService.getRepoHistory()

        if (localForm.scanSubfolders) {
          message.success(`已选择目录，请点击“扫描子仓库”按钮: ${path}`)
          emit('add-log', `已选择父目录进行子文件夹扫描: ${path}`, 'info')
        }
      }
    } catch (error) {
      message.error('选择目录失败')
      console.error('Error in selectRepoPath:', error)
    } finally {
      isSelectingPath.value = false
    }
  }

  const validateRepoPath = () => {
    emit('validate-repo-path', localForm.repoPath)
    if (localForm.repoPath) {
      gitService.addToHistory(localForm.repoPath)
      repoHistory.value = gitService.getRepoHistory()
    }
  }

  const loadAuthors = async () => {
    if (isScanAuthorDisabled.value) {
      message.warning('请先选择一个或多个有效的Git仓库')
      return
    }
    authorsLoading.value = true
    try {
      const reposToScan = localForm.scanSubfolders
        ? [...localForm.selectedRepos]
        : [localForm.repoPath]
      emit('add-log', `加载作者列表于: ${reposToScan.join(', ')}`)
      const authors = await window.api.getRepoAuthors(reposToScan)
      const uniqueAuthors = [...new Set(authors)]
      availableAuthors.value = uniqueAuthors
      emit('add-log', `找到 ${uniqueAuthors.length} 个独立作者`, 'success')
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      emit('add-log', `加载作者列表失败: ${errorMsg}`, 'error')
      message.error('加载作者列表失败')
    } finally {
      authorsLoading.value = false
    }
  }

  const handlePresetChange = (e: any) => {
    const preset = e.target.value
    datePreset.value = preset
    if (preset === '自定义') return
    const range = PRESET_RANGES[preset]
    if (Array.isArray(range)) {
      localForm.dateRange = [range[0], range[1]]
    }
  }

  const selectRecentPath = (path: string) => {
    localForm.repoPath = path
    validateRepoPath()
  }

  const removeRepoFromHistory = (path: string) => {
    gitService.removeFromHistory(path)
    repoHistory.value = gitService.getRepoHistory()
  }

  const clearRepoHistory = () => {
    repoHistory.value.forEach((item) => gitService.removeFromHistory(item.path))
    repoHistory.value = []
  }

  const discoverSubRepos = async () => {
    if (!localForm.repoPath) {
      message.warning('请先选择一个父目录')
      return
    }
    isDiscoveringRepos.value = true
    emit('add-log', `正在扫描子仓库: ${localForm.repoPath}`, 'info')
    try {
      const result = await window.api.getSubRepos(localForm.repoPath)
      if (result.success && result.repos) {
        subRepos.value = result.repos
        if (result.repos.length > 0) {
          emit('add-log', `发现了 ${result.repos.length} 个子仓库`, 'success')
          message.success(`发现了 ${result.repos.length} 个子仓库`)
        } else {
          emit('add-log', '未发现任何子仓库', 'info')
          message.info('未发现任何子仓库')
        }
      } else {
        throw new Error(result.error || 'An unknown error occurred')
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      message.error(`扫描子仓库时出错: ${errorMsg}`)
      emit('add-log', `扫描子仓库时出错: ${errorMsg}`, 'error')
    } finally {
      isDiscoveringRepos.value = false
    }
  }

  const selectAllRepos = () => {
    localForm.selectedRepos = subRepos.value.map((repo) => repo.path)
  }

  const clearAllRepos = () => {
    localForm.selectedRepos = []
  }

  const selectAllBranches = () => {
    localForm.branches = [...availableBranches.value]
  }

  const selectAllAuthors = () => {
    localForm.authorFilter = [...availableAuthors.value]
  }

  const formatLastAccessed = (timestamp: string): string => {
    const date = dayjs(timestamp)
    const now = dayjs()
    if (date.isSame(now, 'day')) return '今天 ' + date.format('HH:mm')
    if (date.isSame(now.subtract(1, 'day'), 'day')) return '昨天 ' + date.format('HH:mm')
    return date.format('MM-DD HH:mm')
  }

  return {
    PRESET_RANGES,
    subRepos,
    isDiscoveringRepos,
    repoHistory,
    availableAuthors,
    authorsLoading,
    branchesLoading,
    availableBranches,
    datePreset,
    isSelectingPath,
    isScanAuthorDisabled,
    loadBranches,
    clearRepoPath,
    selectRepoPath,
    validateRepoPath,
    loadAuthors,
    handlePresetChange,
    selectRecentPath,
    removeRepoFromHistory,
    clearRepoHistory,
    discoverSubRepos,
    selectAllRepos,
    clearAllRepos,
    selectAllBranches,
    selectAllAuthors,
    formatLastAccessed
  }
}