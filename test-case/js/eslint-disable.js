// 测试用例: 使用 eslint-disable 跳过校验
// 这个文件中的错误应该被跳过，不会被检测到

/* eslint-disable no-console */
console.log('这个console.log应该被跳过')
console.error('这个console.error应该被跳过')
console.info('这个console.info应该被跳过')

/* eslint-disable no-unused-vars */
const skippedVariable = '这个变量应该被跳过'
let anotherSkippedVar = '这个变量也应该被跳过'

function testFunction() {
  const skippedInFunction = '函数内被跳过的变量'
  console.log('函数内被跳过的console')
  return 'test'
}

// 行内禁用
console.warn('这个console.warn应该被跳过') // eslint-disable-line no-console

const inlineSkipped = '行内禁用变量' // eslint-disable-line no-unused-vars

// 块级禁用
/* eslint-disable */
const blockSkipped1 = '块级禁用1'
const blockSkipped2 = '块级禁用2'
console.log('块级禁用console')
/* eslint-enable */

// 恢复检测后的代码（应该被检测到）
console.log('这个应该被检测到') // 这个应该触发 no-console
const shouldBeDetected = '这个变量应该被检测到' // 这个应该触发 no-unused-vars