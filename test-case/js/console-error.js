// 测试用例: console 使用错误
// 预期错误: no-console

console.log('这是一个console.log')
console.error('这是一个console.error')

function testFunction() {
    console.info('函数内的console.info')
    return 'test'
}

testFunction()