export const MergeArray = (arr1: any[], arr2: any[], isCover?: boolean, where?: string): any[] => {
  const mergeArray = [...arr1, ...arr2]
  if (!isCover) {
    return mergeArray
  }
  const mergeMap = new Map()
  mergeArray.forEach((item) => {
    if (item.hasOwnProperty(where)) {
      mergeMap.set(item[where as string], item)
    } else {
      return 'where is not exist'
    }
  })
  const resultMergeArray = Array.from(mergeMap.values())
  return resultMergeArray
}

export const getCardBackgroundByChange = (change: number) => {
  // if (change > 0) return { background: 'var(--bg-gradient-red)' }
  // if (change < 0) return { background: 'var(--bg-gradient-green)' }
  return {}
}

// 将扁平数组转换为树形结构
export const buildTree = (list: any[]): any[] => {
  const map = new Map<string, any>()
  const tree: any[] = []

  list.forEach((item) => {
    map.set(item.id, { ...item, children: [] })
  })

  list.forEach((item) => {
    const node = map.get(item.id)!
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children!.push(node)
    } else {
      tree.push(node)
    }
  })

  // 递归排序
  const sortTree = (nodes: any[]) => {
    nodes.sort((a, b) => a.menuSort - b.menuSort)
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        sortTree(node.children)
      }
    })
  }

  sortTree(tree)
  return tree
}

export const copyNormalize = (target: any) => {
  return JSON.parse(JSON.stringify(target))
}

export const loadSystemNotify = ({
  msg,
  option,
  title = 'New Notify'
}: {
  msg: string
  option?: any
  title?: string
}) => {
  new Notification(title, {
    body: msg,
    ...option,
    placement: 'BottomRight',
    duration: 0
  })
}

/**
 * 递归处理菜单/路由数组，生成完整的路径
 * @param nodes - 要处理的菜单项数组
 * @param parentPath - 父节点的路径 (内部递归使用)
 * @returns 返回一个带有完整路径的新数组
 */
export function formatPathsAndFilter(nodes: any[], parentPath: string = ''): any[] {
  // 使用 map 来遍历数组，并返回一个新数组，避免修改原始数据
  return (
    nodes
      // 步骤 1: 过滤掉 hide === "0" 的节点
      .filter((node) => node.hide !== '1')
      // 步骤 2: 对过滤后的数组进行路径格式化
      .map((node) => {
        // 创建节点的副本，以保持原数据不变
        const newNode = { ...node }

        // 根据规则计算当前节点的完整路径
        const fullPath = parentPath ? `${parentPath}/${newNode.path}` : `/${newNode.path}`

        newNode.path = fullPath

        // 如果存在 children 数组，则递归调用自身进行过滤和格式化
        if (newNode.children && newNode.children.length > 0) {
          // 将当前节点的 fullPath 作为下一次递归的 parentPath 传入
          newNode.children = formatPathsAndFilter(newNode.children, fullPath)
        }

        return newNode
      })
  )
}
