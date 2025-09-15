import routes_menu from './schema/router_menu'
import audit_logs from './schema/audit_logs'

export const schema = mergeSchema([routes_menu, audit_logs])
function mergeSchema(schemaArray) {
  let resultSchema = ``
  schemaArray.forEach((element) => {
    resultSchema += element
  })
  return resultSchema
}
