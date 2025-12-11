import type { CliOptions } from '@/cli'
import { type Linter } from 'eslint'
import sonarjs from 'eslint-plugin-sonarjs'
import { readFileSync } from 'fs'

/**
 * 获取ESLint规则
 */
export const initOverrideConfig = (options: CliOptions): Linter.Config[] => {
  const rules = parseRules(options)

  const baseConfig: Linter.Config = {
    languageOptions: {
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest'
      }
    },
    rules: {
      ...rules
      // ...sonarjs.configs.recommended.rules
    },
    // 添加文件忽略配置
    ignores: ['node_modules/**', 'dist/**', 'build/**', '.git/**', '*.min.js', 'coverage/**'],
    // 添加插件配置 - 注意插件名称格式
    plugins: { sonarjs }
  }

  // Vue 配置
  // const vueConfig: Linter.Config = {
  //   files: ['**/*.vue'],
  //   languageOptions: {
  //     parser: vueParser,
  //     parserOptions: {
  //       sourceType: 'module',
  //       ecmaVersion: 'latest',
  //       parser: {
  //         // Vue 文件中的 <script> 标签使用 TypeScript 解析
  //         ts: typescriptParser,
  //         // Vue 文件中的 <script> 标签使用 JavaScript 解析
  //         js: undefined
  //       }
  //     }
  //   }
  // }

  /**
   * TODO
   * 1. 合并Vue配置
   * 2. 合并React配置
   * 3. 合并TypeScript配置
   */

  return [baseConfig]
}

const parseRules = (options: CliOptions): Record<string, any> => {
  const rules = JSON.parse(readFileSync(options.rules, 'utf-8'))
  return rules || {}
}
