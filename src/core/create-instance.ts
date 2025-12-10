import { ESLint, type Linter } from 'eslint'

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
