/**
 * 在当前 Node.js 进程中设置一个环境变量。
 * 注意：所有值都会被转换为字符串。
 * @param {string} key - 环境变量的名称。
 * @param {string | number | boolean} value - 要设置的值，会被转换为字符串。
 */
export const setProcessEnv = (key, value) => {
  // String() 可以安全地处理 null 和 undefined，将它们转换成 'null' 和 'undefined'
  // 这可能不是你想要的行为，所以最好确保传入的值是有效的。
  if (value === null || value === undefined) {
    console.warn(`Warning: Setting env var "${key}" to a nullish value.`)
  }
  process.env[key] = String(value)
}
