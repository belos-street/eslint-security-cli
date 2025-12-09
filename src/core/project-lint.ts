import { ESLint } from 'eslint'

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