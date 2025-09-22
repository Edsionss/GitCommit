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
