// 测试用例: 混合错误类型
// 预期错误: no-console
// 预期警告: no-unused-vars

const unusedConst = '未使用的常量'
let unusedLet = '未使用的let变量'

function complexFunction() {
    const unusedInFunction = '函数内未使用'
    const usedInFunction = '函数内使用'

    console.log('函数内的console.log') // 错误
    console.error(usedInFunction) // 错误

    if (true) {
        const blockScopedUnused = '块级作用域未使用'
        console.warn('条件块内的console') // 错误
    }

    return '函数返回值'
}

// 全局作用域的console
console.info('全局console.info') // 错误
console.debug('全局console.debug') // 错误

// 调用函数
complexFunction()

// 更多未使用变量
var unusedVar1 = 'var1'
const unusedConst2 = 'const2'
let unusedLet3 = 'let3'