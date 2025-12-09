// 测试用例: 安全相关问题
// 预期错误: no-eval, no-implied-eval

function securityIssues() {
  const userInput = 'alert("XSS")'
  
  // 危险: 使用eval
  eval(userInput)
  
  // 危险: 隐式eval
  setTimeout('alert("隐式eval")', 1000)
  setInterval('console.log("隐式eval")', 2000)
  
  // 更危险的情况
  const dynamicCode = 'document.write("<script>alert(\"XSS\")</script>")'
  eval(dynamicCode)
  
  // 使用Function构造函数（也是eval的一种形式）
  const func = new Function('a', 'b', 'return a + b')
  console.log(func(1, 2))
  
  return '安全测试完成'
}

// 调用安全测试函数
securityIssues()

// 全局作用域的eval
eval('console.log("全局eval")')