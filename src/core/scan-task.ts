import type { CliOptions } from '@/cli'
import { initOverrideConfig } from './config-init'
import { createInstance } from './instance-create'
import { lintProject } from './project-lint'
import { outputResults } from './results-output'

/**
 * ESLint扫描函数 - 链式调用所有步骤
 * @param CliOptions 命令行参数
 * @returns 扫描结果和处理状态
 */
export const scanTask = async (cliOptions: CliOptions): Promise<{ status: 'success' }> => {
  const config = initOverrideConfig(cliOptions)
  const eslint = createInstance(config)
  const results = await lintProject(eslint, cliOptions.project)
  outputResults(results)
  return {
    status: 'success'
  }
}