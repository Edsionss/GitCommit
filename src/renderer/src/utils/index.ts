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
  if (change > 0) return { background: 'var(--bg-gradient-red)' }
  if (change < 0) return { background: 'var(--bg-gradient-green)' }
  return {}
}
