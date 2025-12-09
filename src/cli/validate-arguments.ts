import type { Command } from 'commander'
import { validateDirectory, validateFile, validateFileExtension, validateOutputDirectory, getPathDisplayName } from '@/utils'

export type CliOptions = {
  project: string
  output: string
  rules: string
}

export const validateArguments = (program: Command): CliOptions => {
  const options = program.opts()

  // 验证必填参数
  if (!options.project || !options.output || !options.rules) {
    console.error('\n❌ 错误：缺少必填参数！')
    console.error('请确保提供以下三个参数：')
    console.error('  -p, --project <path>  要扫描的项目目录路径')
    console.error('  -o, --output <path>   扫描结果输出文件路径')
    console.error('  -r, --rules <path>    ESLint规则配置文件路径')
    console.error('\n使用 --help 查看详细帮助信息。')
    process.exit(1)
  }

  // 验证project目录
  const projectValidation = validateDirectory(options.project)
  if (!projectValidation.isValid) {
    console.error(`\n❌ 错误：项目目录验证失败！`)
    console.error(`${projectValidation.error}`)
    console.error(`路径：${getPathDisplayName(options.project)}`)
    process.exit(1)
  }

  // 验证output目录
  const outputValidation = validateOutputDirectory(options.output)
  if (!outputValidation.isValid) {
    console.error(`\n❌ 错误：输出目录验证失败！`)
    console.error(`${outputValidation.error}`)
    console.error(`输出文件：${getPathDisplayName(options.output)}`)
    process.exit(1)
  }

  // 验证rules文件
  const rulesValidation = validateFile(options.rules)
  if (!rulesValidation.isValid) {
    console.error(`\n❌ 错误：规则文件验证失败！`)
    console.error(`${rulesValidation.error}`)
    console.error(`规则文件：${getPathDisplayName(options.rules)}`)
    process.exit(1)
  }

  // 验证rules文件扩展名
  const extensionValidation = validateFileExtension(options.rules, '.json')
  if (!extensionValidation.isValid) {
    console.error(`\n❌ 错误：规则文件格式验证失败！`)
    console.error(`${extensionValidation.error}`)
    console.error(`规则文件：${getPathDisplayName(options.rules)}`)
    process.exit(1)
  }

  return options as CliOptions
}

export const displayArguments = (options: CliOptions): void => {
  console.log('\n✅ 参数验证通过！')
  console.log(`项目目录: ${options.project}`)
  console.log(`输出文件: ${options.output}`)
  console.log(`规则文件: ${options.rules}`)
}
