import routes_menu from './schema/router_menu'
import audit_logs from './schema/audit_logs'
import scan_gitcommit from './schema/scan_gitcommit'

export const schema = mergeSchema([audit_logs, routes_menu, scan_gitcommit])
function mergeSchema(schemaArray) {
  let resultSchema = ``
  schemaArray.forEach((element) => {
    resultSchema += element
  })
  return resultSchema
}
