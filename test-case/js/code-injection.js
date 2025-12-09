// 测试用例: 代码注入漏洞
// 预期错误: security/detect-eval-with-expression, security/detect-non-literal-regexp

function codeInjectionVulnerabilities() {
    const userInput = 'alert("注入攻击")';
    const userCode = 'console.log("用户代码")';
    const userRegex = '[a-z]+';

    // 危险: 用户输入直接用于 eval
    eval(userInput);
    eval('var x = "' + userInput + '"');

    // 危险: 动态函数构造
    const dynamicFunction = new Function('a', 'b', userCode);
    dynamicFunction(1, 2);

    // 危险: 用户输入用于 setTimeout/setInterval
    setTimeout(userInput, 1000);
    setInterval(userCode, 2000);

    // 危险: 用户输入用于正则表达式
    const userRegexObj = new RegExp(userRegex);
    console.log(userRegexObj.test('test'));

    // 危险: 动态导入
    const moduleName = './' + userInput + '.js';
    import(moduleName).then(module => {
        console.log('动态导入成功');
    });

    // 危险: 用户输入用于 innerHTML (代码注入)
    const scriptCode = '<script>' + userInput + '</script>';
    document.body.innerHTML = scriptCode;

    // 危险: 模板字符串中的用户输入
    const templateCode = `
    function userFunction() {
      ${userInput}
    }
  `;
    eval(templateCode);

    return '代码注入测试完成';
}

// 更多的注入场景
function advancedInjection() {
    const userData = window.location.hash.substring(1);

    // 危险: 用户输入用于构造函数
    const ConstructorFunction = new Function('return ' + userData);
    const instance = new ConstructorFunction();

    // 危险: 用户输入用于对象属性访问
    const obj = { dangerous: 'method' };
    const propertyName = userData;
    obj[propertyName](); // 可能调用危险方法

    // 危险: 用户输入用于 window 属性
    window[userData] = function () {
        console.log('动态添加的全局函数');
    };

    // 危险: 用户输入用于事件处理
    document.addEventListener('click', new Function(userData));

    return '高级注入测试';
}

// Node.js 环境下的注入
function nodeInjection() {
    const userModule = process.argv[2];
    const userCommand = process.argv[3];

    // 危险: 动态 require
    const module = require(userModule);

    // 危险: 用户命令执行
    const { exec } = require('child_process');
    exec('ls ' + userCommand, (error, stdout, stderr) => {
        console.log(stdout);
    });

    // 危险: 用户输入用于 fs 操作
    const fs = require('fs');
    const userPath = './' + userModule + '.js';
    fs.readFile(userPath, 'utf8', (err, data) => {
        console.log(data);
    });

    return 'Node.js 注入测试';
}

codeInjectionVulnerabilities();
advancedInjection();
nodeInjection();