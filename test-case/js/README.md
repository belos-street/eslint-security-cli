# JavaScript 测试用例

这个目录包含用于测试 ESLint 安全扫描功能的各种 JavaScript 文件。

## 测试文件说明

### 基础规则测试

#### 1. console-error.js
- **目的**: 测试 `no-console` 规则
- **预期错误**: 多个 console 使用
- **包含**: console.log, console.error, console.info

#### 2. unused-vars.js
- **目的**: 测试 `no-unused-vars` 规则
- **预期警告**: 多个未使用的变量
- **包含**: const, let, var 声明的未使用变量

#### 3. mixed-errors.js
- **目的**: 测试混合错误类型
- **预期错误**: no-console
- **预期警告**: no-unused-vars
- **包含**: 函数内外的各种错误

#### 4. code-style.js
- **目的**: 测试代码风格规则
- **预期警告**: semi, quotes, indent, comma-dangle
- **包含**: 缺少分号、双引号、错误缩进、尾随逗号问题

#### 5. eslint-disable.js
- **目的**: 测试 ESLint 禁用指令
- **预期**: 大部分错误应该被跳过
- **包含**: eslint-disable 注释、行内禁用、块级禁用

### 安全规则测试

#### 6. security-issues.js
- **目的**: 测试基础安全规则
- **预期错误**: no-eval, no-implied-eval
- **包含**: eval() 使用, setTimeout/setInterval 字符串参数, Function 构造函数

#### 7. xss-vulnerabilities.js
- **目的**: 测试 XSS 跨站脚本攻击漏洞
- **预期错误**: no-dangerous-html, security/detect-dangerous-html
- **包含**: innerHTML, outerHTML, document.write, dangerouslySetInnerHTML, v-html

#### 8. regex-redos.js
- **目的**: 测试 ReDoS 正则表达式拒绝服务攻击
- **预期错误**: no-unsafe-regex, security/detect-unsafe-regex, sonarjs/regex-complexity
- **包含**: 嵌套量词、复杂正则、循环中的全局正则、用户输入正则

#### 9. code-injection.js
- **目的**: 测试代码注入漏洞
- **预期错误**: security/detect-eval-with-expression, security/detect-non-literal-regexp
- **包含**: 用户输入用于 eval、Function 构造、setTimeout、动态导入、模板注入

#### 10. sonarjs-issues.js
- **目的**: 测试 SonarJS 质量规则
- **预期错误**: sonarjs/no-all-duplicated-branches, sonarjs/no-identical-conditions 等
- **包含**: 重复分支、相同条件、相同表达式、元素覆盖、死存储、认知复杂度过高

#### 11. insecure-random.js
- **目的**: 测试不安全的随机数生成
- **预期错误**: security/detect-insecure-random, security/detect-pseudo-random
- **包含**: Math.random() 用于密码、验证码、会话ID、令牌、加密密钥、CSRF令牌、UUID、盐值、nonce

#### 12. path-traversal.js
- **目的**: 测试路径遍历攻击
- **预期错误**: security/detect-path-traversal, security/detect-non-literal-fs-filename
- **包含**: 用户输入用于文件路径、路径拼接、文件读写、目录遍历、文件权限修改

#### 13. dependency-vulnerabilities.js
- **目的**: 测试依赖包安全漏洞
- **预期错误**: security/detect-child-process, security/detect-buffer-noassert 等
- **包含**: 子进程执行、缓冲区操作、弱加密算法、弱哈希算法、不安全协议、证书验证禁用、JSON解析、反序列化

## 安全测试重点

### XSS 漏洞检测
- 检测 `innerHTML`、`outerHTML` 的直接赋值
- 检测 `document.write()` 的使用
- 检测 React 的 `dangerouslySetInnerHTML`
- 检测 Vue 的 `v-html` 指令

### ReDoS 攻击防护
- 检测嵌套量词模式 `(a+)+b`
- 检测复杂正则表达式（>100字符）
- 检测循环中的全局正则使用
- 检测用户输入直接用于正则表达式

### 代码注入防护
- 检测用户输入用于 `eval()` 和 `Function()`
- 检测用户输入用于 `setTimeout/setInterval`
- 检测动态导入和模板注入
- 检测用户输入用于正则表达式构造

### 路径遍历防护
- 检测用户输入直接用于文件路径
- 检测路径拼接操作
- 检测文件系统操作（读、写、删除）
- 检测目录遍历和文件权限修改

### 依赖包安全
- 检测子进程执行（exec、spawn）
- 检测不安全的加密算法（DES、MD5、SHA1）
- 检测证书验证禁用
- 检测不安全的协议使用（HTTP vs HTTPS）

## 注意事项

- 这些文件故意包含各种 ESLint 错误和警告
- 用于验证扫描工具的正确性和完整性
- `eslint-disable.js` 文件中的大部分错误应该被 ESLint 禁用指令跳过
- 安全测试文件包含真实的安全漏洞模式，请勿在生产代码中使用