import type { CliOptions } from '@/cli'
import { type Linter } from 'eslint'

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