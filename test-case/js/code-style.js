// 测试用例: 代码风格问题
// 预期警告: semi, quotes, indent, comma-dangle

function styleIssues(){
const singleQuotes="应该使用单引号"
const noSemicolon="缺少分号"
  const badIndent="缩进不正确"

const objectStyle={
  prop1:"value1",
  prop2:"value2",
  prop3:"value3"
}

const arrayStyle=[
  "item1",
  "item2",
  "item3"
]

if(true){
console.log("if语句格式错误") // 错误: no-console
}

for(let i=0;i<10;i++){
console.log(i) // 错误: no-console
}

return "函数返回值"
}

styleIssues()