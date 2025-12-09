// 测试用例: 未使用的变量
// 预期警告: no-unused-vars

const unusedVariable = '这个变量没有被使用'
let anotherUnusedVar = 42

function testFunction() {
  const neverUsed = '函数内未使用的变量'
  const usedVar = '这个变量被使用了'
  return usedVar
}

// 变量被声明但未使用
var globalUnused = '全局未使用变量'

// 正确的用法
const activeVariable = '活跃变量'
console.log(activeVariable) // 这里会触发 no-console 错误