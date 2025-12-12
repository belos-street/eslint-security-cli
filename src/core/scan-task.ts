import type { CliOptions } from '@/cli'
import { initOverrideConfig } from './config-init'
import { createInstance } from './instance-create'
import { lintProject } from './project-lint'
import { outputResults } from './results-output'
import type { ESLint } from 'eslint'

type ScanTaskResult = {
  status: 'success'
  stats: {
    errorCount: number
    warningCount: number
  }
}
/**
 * ESLint扫描函数 - 链式调用所有步骤
 * @param CliOptions 命令行参数
 * @returns 扫描结果和处理状态
 */
export const createScanTask = async (cliOptions: CliOptions): Promise<ScanTaskResult> => {
  const config = initOverrideConfig(cliOptions)
  const eslint = createInstance(config)
  const results = await lintProject(eslint, cliOptions.project)
  await outputResults(results, cliOptions)
  const stats = statisticalResults(results)
  return {
    status: 'success',
    stats
  }
}

const statisticalResults = (results: ESLint.LintResult[]) =>
  results.reduce(
    (acc, cur) => {
      acc.errorCount += cur.errorCount
      acc.warningCount += cur.warningCount
      return acc
    },
    { errorCount: 0, warningCount: 0 }
  )
