// 测试用例: SonarJS 质量规则问题
// 预期错误: sonarjs/no-all-duplicated-branches, sonarjs/no-identical-conditions 等

function sonarjsIssues() {
  // 问题: 所有分支都相同
  function checkAllDuplicatedBranches(condition) {
    if (condition) {
      console.log('分支1');
      return true;
    } else {
      console.log('分支1'); // 与 if 分支相同
      return true; // 与 if 分支相同
    }
  }
  
  // 问题: 相同的条件
  function checkIdenticalConditions(a, b) {
    if (a > b) {
      console.log('a 大于 b');
    } else if (a > b) { // 与第一个条件相同
      console.log('a 仍然大于 b');
    }
  }
  
  // 问题: 相同的表达式
  function checkIdenticalExpressions(x, y) {
    const result1 = x + y; // 第一次计算
    const result2 = x + y; // 重复计算
    return result1 + result2;
  }
  
  // 问题: 元素被覆盖
  function checkElementOverwrite() {
    const arr = [1, 2, 3];
    arr[0] = 10;
    arr[0] = 20; // 覆盖了前面的赋值
    return arr;
  }
  
  // 问题: 多余的参数
  function checkExtraArguments() {
    function add(a, b) {
      return a + b;
    }
    
    return add(1, 2, 3); // 多余的参数 3
  }
  
  // 问题: 认知复杂度过高
  function highCognitiveComplexity(flag1, flag2, flag3, flag4) {
    if (flag1) {
      if (flag2) {
        if (flag3) {
          if (flag4) {
            console.log('嵌套太深');
          } else {
            console.log('flag4 为 false');
          }
        } else {
          console.log('flag3 为 false');
        }
      } else {
        console.log('flag2 为 false');
      }
    } else {
      console.log('flag1 为 false');
    }
  }
  
  // 问题: 无意义的赋值
  function checkNoEffectAssignment() {
    let value = 10;
    value = 20; // 这个赋值没有意义，因为后面没有使用
    console.log('无意义的赋值');
    return '结果';
  }
  
  // 问题: 死存储
  function checkDeadStore() {
    let data = getData(); // 获取数据
    data = '新数据'; // 覆盖了前面的值，前面的获取没有意义
    return data;
    
    function getData() {
      return '原始数据';
    }
  }
  
  // 调用测试函数
  checkAllDuplicatedBranches(true);
  checkIdenticalConditions(5, 3);
  checkIdenticalExpressions(1, 2);
  checkElementOverwrite();
  checkExtraArguments();
  highCognitiveComplexity(true, true, true, true);
  checkNoEffectAssignment();
  checkDeadStore();
  
  return 'SonarJS 问题测试完成';
}

// 更多的 SonarJS 问题
function moreSonarjsIssues() {
  // 问题: switch 语句缺少 default
  function missingDefaultSwitch(value) {
    switch (value) {
      case 1:
        return '一';
      case 2:
        return '二';
      case 3:
        return '三';
      // 缺少 default 分支
    }
  }
  
  // 问题: 使用 == 而不是 ===
  function useEqualInsteadOfStrictEqual(a, b) {
    if (a == b) { // 应该使用 ===
      console.log('相等');
    }
    if (a != b) { // 应该使用 !==
      console.log('不相等');
    }
  }
  
  // 问题: 未使用的函数参数
  function unusedParameter(used, unused1, unused2) {
    console.log(used);
    return used * 2;
    // unused1 和 unused2 没有被使用
  }
  
  // 问题: 过于复杂的正则表达式
  const complexRegex = /^((([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})[;]*)+)*$/;
  
  // 问题: 在循环中创建函数
  function createFunctionsInLoop() {
    const functions = [];
    for (let i = 0; i < 10; i++) {
      functions.push(function() { // 在循环中创建函数
        return i;
      });
    }
    return functions;
  }
  
  // 调用测试
  missingDefaultSwitch(2);
  useEqualInsteadOfStrictEqual('5', 5);
  unusedParameter(10, 20, 30);
  complexRegex.test('test@example.com');
  createFunctionsInLoop();
  
  return '更多 SonarJS 问题';
}

sonarjsIssues();
moreSonarjsIssues();