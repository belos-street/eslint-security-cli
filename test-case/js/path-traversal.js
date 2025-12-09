// 测试用例: 路径遍历攻击
// 预期错误: security/detect-path-traversal, security/detect-non-literal-fs-filename

function pathTraversalVulnerabilities() {
  const fs = require('fs');
  const path = require('path');
  
  // 危险: 用户输入直接用于文件路径
  function readUserFile(filename) {
    // 危险: 没有验证用户输入的文件名
    const fileContent = fs.readFileSync(filename, 'utf8');
    return fileContent;
  }
  
  // 危险: 用户输入用于路径拼接
  function getUserFile(userInput) {
    // 危险: 可能导致路径遍历
    const filePath = path.join('./uploads', userInput);
    return fs.readFileSync(filePath, 'utf8');
  }
  
  // 危险: 用户输入用于文件写入
  function writeUserFile(filename, content) {
    // 危险: 用户控制文件名
    fs.writeFileSync(filename, content);
  }
  
  // 危险: 用户输入用于文件删除
  function deleteUserFile(filename) {
    // 危险: 用户可以删除任意文件
    fs.unlinkSync(filename);
  }
  
  // 危险: 用户输入用于目录遍历
  function listDirectory(userPath) {
    // 危险: 路径遍历漏洞
    const files = fs.readdirSync(userPath);
    return files;
  }
  
  // 危险: 用户输入用于文件重命名
  function renameUserFile(oldName, newName) {
    // 危险: 用户可以重命名任意文件
    fs.renameSync(oldName, newName);
  }
  
  // 危险: 用户输入用于文件复制
  function copyUserFile(source, destination) {
    // 危险: 用户可以复制任意文件
    fs.copyFileSync(source, destination);
  }
  
  // 危险: 用户输入用于文件存在检查
  function checkFileExists(filename) {
    // 危险: 用户可以检查任意文件是否存在
    return fs.existsSync(filename);
  }
  
  // 危险: 用户输入用于文件状态获取
  function getFileStats(filename) {
    // 危险: 用户可以获取任意文件信息
    return fs.statSync(filename);
  }
  
  // 危险: 用户输入用于创建目录
  function createUserDirectory(dirName) {
    // 危险: 用户可以创建任意目录
    fs.mkdirSync(dirName, { recursive: true });
  }
  
  // 测试函数
  function testPathTraversal() {
    // 模拟用户输入
    const maliciousInput = '../../../etc/passwd';
    const normalInput = 'user-file.txt';
    
    try {
      console.log('读取用户文件:', readUserFile(normalInput));
      console.log('获取用户文件:', getUserFile(normalInput));
      writeUserFile(normalInput, '测试内容');
      console.log('文件存在:', checkFileExists(normalInput));
    } catch (error) {
      console.log('错误:', error.message);
    }
  }
  
  testPathTraversal();
  
  return '路径遍历测试完成';
}

// 更多的路径遍历场景
function morePathTraversal() {
  const fs = require('fs');
  const path = require('path');
  
  // 危险: 用户输入用于相对路径解析
  function resolveUserPath(userInput) {
    // 危险: 可能导致路径遍历
    const resolvedPath = path.resolve('./uploads', userInput);
    return resolvedPath;
  }
  
  // 危险: 用户输入用于规范化路径
  function normalizeUserPath(userInput) {
    // 危险: 规范化后可能访问到预期外的文件
    const normalizedPath = path.normalize(userInput);
    return normalizedPath;
  }
  
  // 危险: 用户输入用于文件扩展名检查
  function checkFileExtension(filename) {
    // 危险: 用户可以绕过扩展名检查
    const ext = path.extname(filename);
    if (ext === '.txt') {
      return fs.readFileSync(filename, 'utf8');
    }
    return '不支持的文件类型';
  }
  
  // 危险: 用户输入用于通配符匹配
  function globUserFiles(pattern) {
    // 危险: 用户可以使用通配符访问任意文件
    const glob = require('glob');
    return glob.sync(pattern);
  }
  
  // 危险: 用户输入用于符号链接创建
  function createSymlink(target, linkPath) {
    // 危险: 用户可以创建指向任意文件的符号链接
    fs.symlinkSync(target, linkPath);
  }
  
  // 危险: 用户输入用于文件权限修改
  function changeFilePermissions(filename, mode) {
    // 危险: 用户可以修改任意文件的权限
    fs.chmodSync(filename, mode);
  }
  
  // 危险: 用户输入用于文件所有者修改
  function changeFileOwner(filename, uid, gid) {
    // 危险: 用户可以修改任意文件的所有者
    fs.chownSync(filename, uid, gid);
  }
  
  // 危险: 用户输入用于文件时间戳修改
  function changeFileTimes(filename, atime, mtime) {
    // 危险: 用户可以修改任意文件的时间戳
    fs.utimesSync(filename, atime, mtime);
  }
  
  // 测试
  console.log('解析用户路径:', resolveUserPath('../config.json'));
  console.log('规范化用户路径:', normalizeUserPath('../secret.txt'));
  console.log('文件扩展名检查:', checkFileExtension('file.txt'));
  console.log('通配符匹配:', globUserFiles('*.txt'));
  
  return '更多路径遍历测试';
}

// Web 应用中的路径遍历
function webPathTraversal() {
  // 危险: Express 中的路径遍历
  function expressPathVulnerability(req, res) {
    const filename = req.query.filename;
    
    // 危险: 用户输入直接用于文件读取
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) {
        res.status(404).send('文件未找到');
      } else {
        res.send(data);
      }
    });
  }
  
  // 危险: 静态文件服务中的路径遍历
  function serveStaticFile(req, res) {
    const filePath = req.params.filename;
    
    // 危险: 没有验证文件路径
    res.sendFile(filePath);
  }
  
  return 'Web 路径遍历测试';
}

pathTraversalVulnerabilities();
morePathTraversal();
webPathTraversal();