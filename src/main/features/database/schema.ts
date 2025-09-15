import routes_menu from './schema/router_menu'
import audit_logs from './schema/audit_logs'
import git_commit from './schema/git_commit'

export const schema = mergeSchema([routes_menu, audit_logs, git_commit])
function mergeSchema(schemaArray) {
  let resultSchema = ``
  schemaArray.forEach((element) => {
    resultSchema += element
  })
  return resultSchema
}
