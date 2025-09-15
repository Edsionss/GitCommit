import { dbHelper } from '@features/database'
import type { RouteRecord } from '@sharedType/MenuManagement'
import { nanoid } from 'nanoid'

// =================================================================
// 1. 如何新增 (Insert)
// =================================================================
export function addRouteExample() {
  console.log('--- Running Add Example ---')

  const newRoute: Omit<RouteRecord, 'children'> = {
    id: nanoid(), // 使用 nanoid 生成唯一的字符串 ID
    parentId: null, // 顶级菜单
    path: '/system',
    name: 'System',
    componentPath: 'layouts/BasicLayout',
    meta: {
      title: '系统管理',
      keepAlive: '1'
    },
    menuOrder: 1,
    menuIcon: 'setting',
    hide: '0'
  }

  // **关键点**: 在插入数据库前，必须将 meta 对象序列化为 JSON 字符串
  const dataToInsert = {
    ...newRoute,
    meta: JSON.stringify(newRoute.meta)
  }

  try {
    const result = dbHelper.insert('routes', dataToInsert)
    console.log(`Route added successfully! Changes: ${result.changes}`)
    return newRoute.id // 返回新创建的ID
  } catch (error) {
    console.error('Failed to add route:', error)
  }
}

// =================================================================
// 2. 如何查询 (Find)
// =================================================================
export function findRoutesExample(systemRouteId: string) {
  console.log('\n--- Running Find Example ---')

  // a) 查询单条记录 (findOne)
  console.log('Finding a single route by ID:', systemRouteId)
  // 注意：从数据库读出的行，meta 字段是字符串
  const rawRoute = dbHelper.findOne<any>('routes', { id: systemRouteId })

  if (rawRoute) {
    // **关键点**: 从数据库读出后，需要将 meta 字符串解析回对象
    const route: RouteRecord = {
      ...rawRoute,
      meta: JSON.parse(rawRoute.meta)
    }
    console.log('Found route:', route)
  }

  // b) 查询多条记录 (find) - 例如，查询所有顶级菜单
  console.log('Finding all top-level routes...')
  const rawTopRoutes = dbHelper.find<any>('routes', { parent_id: null })
  const topRoutes: RouteRecord[] = rawTopRoutes.map((r) => ({
    ...r,
    meta: JSON.parse(r.meta)
  }))
  console.log(`Found ${topRoutes.length} top-level routes.`)

  // c) 查询所有记录并构建成树形结构 (非常常见的需求)
  const allRoutesRaw = dbHelper.find<any>('routes', {}, '*, id, parent_id as parentId') // 使用别名以匹配JS命名习惯
  const allRoutes: RouteRecord[] = allRoutesRaw.map((r) => ({
    ...r,
    meta: JSON.parse(r.meta)
  }))

  function buildTree(list: RouteRecord[], parentId: string | null = null): RouteRecord[] {
    return list
      .filter((item) => item.parentId === parentId)
      .sort((a, b) => a.menuOrder - b.menuOrder)
      .map((item) => ({
        ...item,
        children: buildTree(list, item.id)
      }))
  }

  const routeTree = buildTree(allRoutes)
  console.log('Constructed route tree:', JSON.stringify(routeTree, null, 2))
}

// =================================================================
// 3. 如何更新 (Update)
// =================================================================
export function updateRouteExample(systemRouteId: string) {
  console.log('\n--- Running Update Example ---')

  const updateData = {
    menu_order: 99,
    menu_icon: 'new-icon'
  }

  const result = dbHelper.update('routes', updateData, { id: systemRouteId })
  console.log(`Update finished. Rows affected: ${result.changes}`)

  // 如果要更新 meta 里的内容，需要先读-改-写
  const routeToUpdate = dbHelper.findOne<any>('routes', { id: systemRouteId })
  if (routeToUpdate) {
    const meta = JSON.parse(routeToUpdate.meta)
    meta.title = '系统管理 (已更新)' // 修改标题
    const resultMeta = dbHelper.update(
      'routes',
      { meta: JSON.stringify(meta) },
      { id: systemRouteId }
    )
    console.log(`Meta title updated. Rows affected: ${resultMeta.changes}`)
  }
}

// =================================================================
// 4. 如何删除 (Delete)
// =================================================================
export function deleteRouteExample(systemRouteId: string) {
  console.log('\n--- Running Delete Example ---')
  const result = dbHelper.delete('routes', { id: systemRouteId })
  console.log(`Delete finished. Rows affected: ${result.changes}`)
  console.log('由于设置了 ON DELETE CASCADE，所有子菜单（如果有）也会被自动删除。')
}

// =================================================================
// 5. 如何使用事务 (Transaction)
// =================================================================
export function transactionExample() {
  console.log('\n--- Running Transaction Example ---')

  const parent = {
    id: 'dashboard',
    parentId: null,
    name: 'Dashboard',
    path: '/dashboard',
    componentPath: 'views/Dashboard',
    meta: { title: '仪表盘' },
    menuOrder: 0,
    hide: '0'
  }
  const child1 = {
    id: 'dashboard-analysis',
    parentId: 'dashboard',
    name: 'Analysis',
    path: 'analysis',
    componentPath: 'views/Analysis',
    meta: { title: '分析页' },
    menuOrder: 1,
    hide: '0'
  }
  const child2 = {
    id: 'dashboard-monitor',
    parentId: 'dashboard',
    name: 'Monitor',
    path: 'monitor',
    componentPath: 'views/Monitor',
    meta: { title: '监控页' },
    menuOrder: 2,
    hide: '0'
  }

  try {
    // 使用我们之前为 dbHelper 添加的 transaction 方法
    dbHelper.transaction(() => {
      console.log('Starting transaction...')
      dbHelper.insert('routes', { ...parent, meta: JSON.stringify(parent.meta) })
      dbHelper.insert('routes', { ...child1, meta: JSON.stringify(child1.meta) })

      // 故意制造一个错误来测试回滚
      // if (true) {
      //   throw new Error("Something went wrong, transaction should rollback!");
      // }

      dbHelper.insert('routes', { ...child2, meta: JSON.stringify(child2.meta) })
      console.log('All routes inserted within transaction.')
    }) // better-sqlite3 的 transaction 返回一个函数，需要调用它

    console.log('Transaction committed successfully!')
  } catch (error) {
    console.error('Transaction failed and was rolled back:', error.message)
    const dashboardRoute = dbHelper.findOne('routes', { id: 'dashboard' })
    console.log(`Is dashboard route in DB? ${!!dashboardRoute}`) // 应该是 false
  }
}

// =================================================================
// 执行示例
// =================================================================
// 清理一下，保证每次运行环境干净
dbHelper.execute('DELETE FROM routes')

const systemRouteId = addRouteExample()
if (systemRouteId) {
  findRoutesExample(systemRouteId)
  updateRouteExample(systemRouteId)
  deleteRouteExample(systemRouteId)
}
transactionExample()
