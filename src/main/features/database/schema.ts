import routes_menu from './schema/router_menu'
import audit_logs from './schema/audit_logs'
import scan_gitcommit from './schema/scan_gitcommit'
import stock_sectors from './schema/stock/stock_sectors'
import stock_news from './schema/stock/stock_news'
import stock_funds from './schema/stock/stock_funds'
import stock_hot_rank from './schema/stock/stock_hot_rank'
import chat_sessions from './schema/chat_sessions'
import scheduled_tasks from './schema/scheduled_tasks'

export const schema = mergeSchema([
  audit_logs,
  routes_menu,
  scan_gitcommit,
  stock_sectors,
  stock_news,
  stock_funds,
  stock_hot_rank,
  chat_sessions,
  scheduled_tasks
])
function mergeSchema(schemaArray) {
  let resultSchema = ``
  schemaArray.forEach((element) => {
    resultSchema += element
  })
  return resultSchema
}
