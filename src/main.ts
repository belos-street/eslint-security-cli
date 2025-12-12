#!/usr/bin/env bun

import { createCommand, displayArguments, validateArguments, createSimpleBanner } from './cli'
import { CONFIG_DEFAULT } from './config'
import { createScanTask } from './core'

const bootstrap = async () => {
  // 1.打印name
  console.log(createSimpleBanner(CONFIG_DEFAULT.name))

  /**
   * 2.初始化命令行
   *  2.1 解析命令行参数
   *  2.2 验证参数
   *  2.3 显示参数
   */
  const program = createCommand()
  program.parse(process.argv) //2.1
  const options = validateArguments(program) //2.2
  displayArguments(options) //2.3

  /**
   * 3. 执行扫描任务
   */
  console.log('\n🚀 开始执行ESLint安全扫描...')
  createScanTask(options)
    .then((res) => {
      const { stats } = res
      console.log('✅ 扫描任务完成！')
      console.log(`🔍 发现 ${stats.errorCount} 个错误和 ${stats.warningCount} 个警告`)
    })
    .catch((err) => {
      console.error('❌ 扫描任务执行失败:', err)
      process.exit(1)
    })
}

bootstrap()
