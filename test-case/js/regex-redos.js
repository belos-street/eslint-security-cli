// 测试用例: ReDoS 正则表达式拒绝服务攻击
// 预期错误: no-unsafe-regex, security/detect-unsafe-regex, sonarjs/regex-complexity

function redosVulnerabilities() {
  // 危险: 嵌套量词，可能导致 ReDoS
  const dangerousRegex1 = /(a+)+b/;
  const dangerousRegex2 = /(.*a){x}/;
  const dangerousRegex3 = /(a*)*$/;
  
  // 危险: 复杂正则表达式
  const complexRegex = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/;
  
  // 危险: 在循环中使用全局正则
  function validateLoop(items) {
    const regex = /([a-z]+)*$/g; // 全局标志在循环中使用
    
    for (let i = 0; i < items.length; i++) {
      // 危险: 在循环中使用全局正则可能导致性能问题
      if (regex.test(items[i])) {
        console.log('匹配:', items[i]);
      }
    }
  }
  
  // 危险: 用户输入直接用于正则表达式
  function validateUserInput(userInput) {
    // 危险: 用户输入可能包含恶意正则
    const userRegex = new RegExp(userInput);
    return userRegex.test('test string');
  }
  
  // 危险: 超长的正则表达式
  const longRegex = /^((([a-zA-Z0-9._%-]+)@([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,6})[;]*)+)*$/;
  
  // 危险: 回溯严重的正则
  const backtrackRegex = /^(a+)+b/;
  
  // 测试函数
  function testRedos() {
    const testStrings = [
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaab',
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaac' // 这将导致严重的回溯
    ];
    
    testStrings.forEach(str => {
      console.log(`测试字符串: ${str}`);
      console.log(`结果: ${backtrackRegex.test(str)}`);
    });
  }
  
  validateLoop(['test1', 'test2', 'test3']);
  validateUserInput('([a-z]+)*$');
  testRedos();
  
  return 'ReDoS 测试完成';
}

// 更多的 ReDoS 模式
function moreRedosPatterns() {
  // 危险: 指数级回溯
  const pattern1 = /(a*)*b/;
  const pattern2 = /(a*)+b/;
  const pattern3 = /(a+)*b/;
  
  // 危险: 复杂的嵌套结构
  const nestedPattern = /^((([a-z]+)*)+)*$/;
  
  // 危险: 在事件处理中使用
  document.addEventListener('input', function(e) {
    const dangerousPattern = /([a-z]*)*$/;
    if (dangerousPattern.test(e.target.value)) {
      console.log('输入匹配');
    }
  });
  
  return '更多 ReDoS 模式测试';
}

redosVulnerabilities();
moreRedosPatterns();