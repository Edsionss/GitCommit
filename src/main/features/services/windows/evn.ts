// modify-windows-env.js

import { execSync } from 'child_process'
// 检查是否在 Windows 系统上运行
if (process.platform !== 'win32') {
  console.error('此脚本只能在 Windows 系统上运行。')
  process.exit(1)
}

/**
 * 使用 setx 命令永久设置一个环境变量。
 * @param {string} key 环境变量的名称
 * @param {string} value 环境变量的值
 * @param {boolean} isSystemVar 是否设置为系统变量 (需要管理员权限)
 */
function setPermanentEnvVar(key, value, isSystemVar = false) {
  console.log(`正在设置环境变量: ${key} = ${value}`)
  try {
    // setx 命令需要将值放在最后
    // /M 开关表示设置系统变量 (Machine level)
    const command = `setx ${key} "${value}" ${isSystemVar ? '/M' : ''}`
    console.log(`执行命令: ${command}`)

    // 使用 execSync 同步执行命令
    const output = execSync(command)
    console.log(`命令输出: ${output.toString()}`)
    console.log(`✅ 成功设置环境变量 "${key}"。请重新打开一个新的终端以使其生效。`)
  } catch (error) {
    error as Error
    console.error(`❌ 设置环境变量 "${key}" 时出错:`, error.message)
    if (isSystemVar && error.message.includes('access denied')) {
      console.error('提示: 设置系统变量需要以管理员权限运行此脚本。')
    }
  }
}

/**
 * 使用 setx 删除一个环境变量 (通过设置为空值)。
 * 注意: 这并不是真正的删除，而是将其值清空。真正的删除需要操作注册表。
 * @param {string} key 环境变量的名称
 * @param {boolean} isSystemVar 是否为系统变量 (需要管理员权限)
 */
function deletePermanentEnvVar(key, isSystemVar = false) {
  console.log(`正在删除环境变量: ${key}`)
  try {
    // setx 没有直接的删除命令，最佳实践是将其值设置为空
    const command = `setx ${key} "" ${isSystemVar ? '/M' : ''}`
    console.log(`执行命令: ${command}`)
    execSync(command)
    console.log(`✅ 成功将环境变量 "${key}" 的值清空。请重新打开一个新的终端以使其生效。`)
  } catch (error) {
    error as Error

    console.error(`❌ 删除环境变量 "${key}" 时出错:`, error.message)
  }
}

// --- 使用示例 ---

// 1. 新增/修改一个【用户】环境变量
// setPermanentEnvVar('MY_NODE_APP_VERSION', '1.0.2')

// 2. 新增/修改一个【系统】环境变量 (需要管理员权限!)
// setPermanentEnvVar('GLOBAL_API_ENDPOINT', 'https://api.mycompany.com', true);

// 3. 删除一个【用户】环境变量 (将其值设为空)
// deletePermanentEnvVar('MY_NODE_APP_VERSION');
