import { sysLogger } from '@nodeUtils/sysLogger'
import { promises as fs } from 'fs'
import path from 'path'
import type { RouteRecordWithOptionalId } from '@sharedType/MenuManagement'

export class ConfigService {
  private static readonly CONFIG_PATH = path.join(process.cwd(), 'src/renderer/src/config/index.ts')

  /**
   * 更新默认菜单配置
   * @param {RouteRecordWithOptionalId[]} menus - 新的默认菜单数据
   */
  public async updateDefaultMenu(menus: RouteRecordWithOptionalId[]): Promise<boolean> {
    try {
      // 读取当前配置文件内容
      const configContent = await fs.readFile(ConfigService.CONFIG_PATH, 'utf8')
      
      // 提取导入语句
      const importMatch = configContent.match(/import\s+{\s*RouteRecordWithOptionalId\s*}\s+from\s+['"][^'"]+['"];?/);
      const importStatement = importMatch ? importMatch[0] : `import { RouteRecordWithOptionalId } from '@sharedType/MenuManagement'`;
      
      // 生成新的菜单配置内容
      const menuConfig = this.generateMenuConfig(menus);
      
      // 构建新的文件内容
      const newContent = `${importStatement}\n\nexport const DEFAULT_MENU_MAP: RouteRecordWithOptionalId[] = ${menuConfig}`;
      
      // 写入文件
      await fs.writeFile(ConfigService.CONFIG_PATH, newContent, 'utf8');
      
      sysLogger.info('Default menu configuration updated successfully');
      return true;
    } catch (error) {
      sysLogger.error('Error updating default menu configuration:', error);
      return false;
    }
  }

  /**
   * 生成菜单配置的字符串表示
   * @param {RouteRecordWithOptionalId[]} menus - 菜单数据
   * @returns {string} 菜单配置的字符串表示
   */
  private generateMenuConfig(menus: RouteRecordWithOptionalId[]): string {
    // 将菜单数据转换为格式化的字符串
    const menuString = JSON.stringify(menus, null, 2)
      .replace(/"([^"]+)":/g, '$1:') // 移除属性名的引号
      .replace(/: "([^"]+)"/g, ': \'$1\'') // 将双引号字符串改为单引号
      .replace(/: (\d+)/g, ': $1') // 确保数字不使用引号
      .replace(/: null/g, ': null') // 确保null不使用引号
    
    // 处理meta对象
    const processedString = menuString
      .replace(/meta: ({[^}]*})/g, (match, p1) => {
        // 处理meta对象内部的内容
        return `meta: ${p1.replace(/"([^"]+)":/g, '$1:').replace(/: "([^"]*)"/g, ': \'$1\'')}`;
      });
    
    return `[\n${processedString.slice(1, -1)}\n]`;
  }
}

export const configService = new ConfigService()