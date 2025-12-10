import type { CliOptions } from '@/cli'
import { type Linter } from 'eslint'
import sonarjs from 'eslint-plugin-sonarjs'
import typescriptParser from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'

/**
 * 获取ESLint规则
 */
export const initOverrideConfig = (options: CliOptions): Linter.Config[] => {
  //通过options拿到rule.json 读取内容,并赋值给rules
  const rules = {}

  // 基础配置 - 适用于所有文件
  const baseConfig: Linter.Config = {
    languageOptions: {
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest'
      }
    },
    rules: {
      ...sonarjs.configs.recommended.rules
    },
    // 添加文件忽略配置
    ignores: ['node_modules/**', 'dist/**', 'build/**', '.git/**', '*.min.js', 'coverage/**'],
    // 添加插件配置 - 注意插件名称格式
    plugins: {
      sonarjs
    }
  }

  // Vue 配置
  const vueConfig: Linter.Config = {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
        parser: {
          // Vue 文件中的 <script> 标签使用 TypeScript 解析
          ts: typescriptParser,
          // Vue 文件中的 <script> 标签使用 JavaScript 解析
          js: undefined
        }
      }
    }
  }

  return [baseConfig, vueConfig]
}
