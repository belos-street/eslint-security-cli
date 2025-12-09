import { CONFIG_DEFAULT } from '@/config/config-default'
import { Command } from 'commander'

export const createCommand = (): Command => {
  // 设置版本信息
  const program = new Command()
  program.version(CONFIG_DEFAULT.version, '-v, --version', '显示版本号')

  // 自定义帮助信息
  program.helpOption('-h, --help', '显示帮助信息').description(CONFIG_DEFAULT.description)

  // 扫描项目参数（必填）
  program.requiredOption('-p, --project <path>', '要扫描的项目目录路径（绝对路径，例如：/Users/project/src）')
  program.requiredOption('-o, --output <path>', '扫描结果输出文件路径（绝对路径，例如：/Users/project/results）')
  program.requiredOption('-r, --rules <path>', 'ESLint规则配置文件路径（绝对路径，例如：/Users/config/security-rules.json）')

  return program
}
