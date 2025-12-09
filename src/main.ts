#!/usr/bin/env bun

import { createCommand, displayArguments, validateArguments, printFiglet } from './cli'
import { scanTask } from './core'

const bootstrap = async () => {
  try {
    // 1. 打印figlet
    printFiglet()

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
    const result = await scanTask(options)

    if (result.status === 'success') {
      console.log('✅ 扫描任务完成！')
    }
  } catch (error) {
    console.error('❌ 程序执行失败:', error)
    process.exit(1)
  }
}

bootstrap()
