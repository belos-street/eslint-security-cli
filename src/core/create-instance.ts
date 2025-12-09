import type { CliOptions } from '@/cli'
import { ESLint, type Linter } from 'eslint'

/**
 * 获取ESLint规则
 */
export const initOverrideConfig = (options: CliOptions): Linter.Config => {
  //todo
  const overrideConfig: Linter.Config = {
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: 'commonjs'
    },
    rules: {
      'no-console': 'error',
      'no-unused-vars': 'warn'
    },
    // 添加文件忽略配置
    ignores: ['node_modules/**', 'dist/**', 'build/**', '.git/**', '*.min.js', 'coverage/**']
  }

  return overrideConfig
}

/**
 * 创建ESLint实例
 * @param overrideConfig 覆盖配置
 * @returns ESLint实例
 */
export const createInstance = (overrideConfig: Linter.Config): ESLint => {
  return new ESLint({
    overrideConfig,
    overrideConfigFile: true
  })
}

/**
 * 项目代码检查
 * @param eslint ESLint实例
 * @param filePath 项目路径
 * @returns 检查结果
 */
export const lintProject = async (eslint: ESLint, filePath: string): Promise<ESLint.LintResult[]> => {
  const results = await eslint.lintFiles([filePath])
  return results
}

/**
 * 输出检查结果
 * @param results 检查结果
 */
export const outputResults = (results: ESLint.LintResult[]) => {
  //todo
}

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
