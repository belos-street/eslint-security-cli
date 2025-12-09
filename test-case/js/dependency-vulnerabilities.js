// 测试用例: 依赖包安全漏洞
// 预期错误: security/detect-child-process, security/detect-buffer-noassert 等

function dependencyVulnerabilities() {
  const { exec, execSync, spawn, spawnSync } = require('child_process');
  const crypto = require('crypto');
  
  // 危险: 用户输入用于子进程执行
  function executeUserCommand(userCommand) {
    // 危险: 可能导致命令注入
    exec(userCommand, (error, stdout, stderr) => {
      console.log(stdout);
    });
  }
  
  // 危险: 用户输入用于同步命令执行
  function executeUserCommandSync(userCommand) {
    // 危险: 同步执行用户命令
    const result = execSync(userCommand);
    return result.toString();
  }
  
  // 危险: 用户输入用于 spawn
  function spawnUserProcess(command, args) {
    // 危险: 用户可以执行任意进程
    const child = spawn(command, args);
    
    child.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });
    
    return child;
  }
  
  // 危险: 用户输入用于 spawnSync
  function spawnUserProcessSync(command, args) {
    // 危险: 同步 spawn 用户进程
    const result = spawnSync(command, args);
    return result;
  }
  
  // 危险: 不安全的缓冲区操作
  function unsafeBufferOperations() {
    const buffer = Buffer.alloc(100);
    const offset = 50;
    
    // 危险: 没有检查偏移量的有效性
    buffer.write('test', offset);
    
    // 危险: 读取可能超出缓冲区边界
    const data = buffer.toString('utf8', 0, 200);
    
    return data;
  }
  
  // 危险: 使用 noassert 模式
  function bufferNoassert() {
    const buffer = Buffer.from('hello world');
    
    // 危险: 使用 noassert 选项，不检查边界
    const value = buffer.readUInt32BE(0, true); // true 表示 noassert
    
    return value;
  }
  
  // 危险: 不安全的加密操作
  function unsafeCryptoOperations() {
    const secret = 'my-secret-key';
    
    // 危险: 使用弱加密算法
    const cipher = crypto.createCipher('des', secret);
    let encrypted = cipher.update('hello world', 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return encrypted;
  }
  
  // 危险: 使用弱哈希算法
  function weakHashAlgorithm() {
    const data = 'sensitive data';
    
    // 危险: 使用 MD5 (已被破解)
    const hash1 = crypto.createHash('md5').update(data).digest('hex');
    
    // 危险: 使用 SHA1 (已被破解)
    const hash2 = crypto.createHash('sha1').update(data).digest('hex');
    
    return { md5: hash1, sha1: hash2 };
  }
  
  // 危险: 不安全的随机数生成
  function insecureRandomGeneration() {
    // 危险: 使用 Math.random() 生成密钥
    const key = Math.random().toString(36);
    
    // 危险: 使用不安全的随机数生成 IV
    const iv = Buffer.alloc(16);
    for (let i = 0; i < 16; i++) {
      iv[i] = Math.floor(Math.random() * 256);
    }
    
    return { key, iv };
  }
  
  // 测试函数
  function testDependencyVulnerabilities() {
    // 模拟用户输入
    const userCommand = 'ls -la';
    const userArgs = ['-la'];
    
    try {
      console.log('执行用户命令:', executeUserCommandSync(userCommand));
      
      const child = spawnUserProcess('ls', userArgs);
      child.on('close', (code) => {
        console.log(`子进程退出码: ${code}`);
      });
      
      console.log('缓冲区操作:', unsafeBufferOperations());
      console.log('加密结果:', unsafeCryptoOperations());
      console.log('哈希结果:', weakHashAlgorithm());
      console.log('随机数生成:', insecureRandomGeneration());
    } catch (error) {
      console.log('错误:', error.message);
    }
  }
  
  testDependencyVulnerabilities();
  
  return '依赖包漏洞测试完成';
}

// 更多的依赖包安全问题
function moreDependencyVulnerabilities() {
  const https = require('https');
  const http = require('http');
  const url = require('url');
  
  // 危险: 禁用证书验证
  function disableCertificateValidation() {
    const options = {
      hostname: 'example.com',
      port: 443,
      path: '/',
      method: 'GET',
      rejectUnauthorized: false // 危险: 禁用证书验证
    };
    
    const req = https.request(options, (res) => {
      console.log(`状态码: ${res.statusCode}`);
    });
    
    req.end();
  }
  
  // 危险: 使用 HTTP 而不是 HTTPS
  function useInsecureProtocol() {
    const options = {
      hostname: 'sensitive-api.com',
      port: 80,
      path: '/api/data',
      method: 'POST'
    };
    
    // 危险: 使用不安全的 HTTP 协议
    const req = http.request(options, (res) => {
      console.log(`状态码: ${res.statusCode}`);
    });
    
    req.write('敏感数据');
    req.end();
  }
  
  // 危险: 不安全的 URL 解析
  function unsafeUrlParsing(userUrl) {
    // 危险: 用户输入直接用于 URL 解析
    const parsedUrl = url.parse(userUrl);
    
    // 危险: 没有验证协议
    if (parsedUrl.protocol === 'javascript:') {
      console.log('危险: javascript 协议');
    }
    
    return parsedUrl;
  }
  
  // 危险: 不安全的 JSON 解析
  function unsafeJsonParsing(jsonString) {
    // 危险: 直接解析用户输入的 JSON，可能导致原型污染
    const obj = JSON.parse(jsonString);
    
    // 危险: 没有验证解析后的对象
    if (obj.constructor) {
      console.log('对象有构造函数');
    }
    
    return obj;
  }
  
  // 危险: 使用 eval() 解析 JSON
  function evalJsonParsing(jsonString) {
    // 危险: 使用 eval 解析 JSON，可能导致代码注入
    const obj = eval('(' + jsonString + ')');
    return obj;
  }
  
  // 危险: 不安全的反序列化
  function unsafeDeserialization(serializedData) {
    // 危险: 直接反序列化用户数据
    const obj = JSON.parse(serializedData);
    
    // 危险: 执行反序列化对象的方法
    if (obj.run && typeof obj.run === 'function') {
      obj.run();
    }
    
    return obj;
  }
  
  // 测试
  console.log('证书验证测试');
  disableCertificateValidation();
  
  console.log('不安全协议测试');
  useInsecureProtocol();
  
  console.log('URL 解析:', unsafeUrlParsing('http://example.com'));
  console.log('JSON 解析:', unsafeJsonParsing('{"key": "value"}'));
  console.log('eval JSON 解析:', evalJsonParsing('{"key": "value"}'));
  console.log('反序列化:', unsafeDeserialization('{"run": "function() { console.log(\"执行了\"); }"}'));
  
  return '更多依赖包漏洞测试';
}

dependencyVulnerabilities();
moreDependencyVulnerabilities();