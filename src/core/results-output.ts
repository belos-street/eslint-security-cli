import type { CliOptions } from '@/cli'
import { ESLint } from 'eslint'
import { writeFile } from 'fs/promises'
import { join } from 'path'

/**
 * 输出检查结果
 * @param results 检查结果
 */
export const outputResults = async (results: ESLint.LintResult[], cliOptions: CliOptions) => {
  const filePath = join(cliOptions.output, 'results.json')
  await writeFile(filePath, JSON.stringify(results, null, 2), 'utf-8')
}
