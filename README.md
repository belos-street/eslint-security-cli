# 🔒 ESLint Security CLI

> A powerful static code analysis tool designed specifically for security scanning, built on ESLint engine with Bun runtime

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-%3E%3D1.0.0-000?logo=bun)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-blue?logo=typescript)](https://www.typescriptcriptlang.org)
[![ESLint](https://img.shields.io/badge/ESLint-9.19.0-4B32C3?logo=eslint)](https://eslint.org)

## 🌟 Features

- **🔍 安全扫描**：基于ESLint引擎的深度静态代码分析
- **🛡️ 漏洞检测**：XSS、ReDoS、代码注入等常见安全漏洞
- **📊 多格式支持**：JavaScript、TypeScript、Vue、React全覆盖
- **⚡ 高性能**：基于Bun运行时，编译为原生二进制
- **🎯 精准规则**：集成SonarJS质量规则，自定义安全规则
- **📱 跨平台**：支持macOS、Linux、Windows全平台

## 🚀 Quick Start

### Installation

#### 源码构建
```bash
git clone https://github.com/your-username/eslint-security-cli.git
cd eslint-security-cli
bun install
bun run build:binary
sudo cp bin/eslint-security-cli /usr/local/bin/
```

### Basic Usage

#### � 30秒快速开始

```bash
# 1. 克隆项目并构建
git clone https://github.com/your-username/eslint-security-cli.git
cd eslint-security-cli
bun install
bun run build:binary

# 2. 创建简单的规则配置
echo '{"rules":{"security/detect-object-injection":"error","security/detect-unsafe-regex":"error","no-eval":"error"}}' > security-rules.json

# 3. 扫描测试用例
./bin/eslint-security-cli -p ./test-case/js -o ./results.json -r ./security-rules.json

# 4. 查看结果
cat results.json | jq '.issues | length'  # 查看发现的问题数量
```

#### 📋 参数验证检查清单

在执行扫描前，请确认：

✅ **项目路径存在**：`-p` 指定的目录必须存在且包含源代码文件  
✅ **输出路径有效**：`-o` 指定的路径必须有写入权限  
✅ **规则文件有效**：`-r` 指定的JSON文件必须包含有效的ESLint规则  
✅ **文件扩展名支持**：确保项目包含支持的文件类型（.js, .ts, .vue等）  

#### 🛠️ 常见问题解决

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| `ENOENT: no such file or directory` | 路径不存在 | 使用绝对路径，确认文件存在 |
| `Permission denied` | 没有写入权限 | 检查输出目录权限，使用 `chmod` 修改 |
| `Invalid JSON` | 规则配置格式错误 | 使用JSON验证工具检查配置文件 |
| `No files found` | 项目目录为空 | 确认目录包含支持的文件类型 |
| `Segmentation fault` | 内存不足 | 减小扫描范围，分批处理大项目 |

#### 🚀 高级用法

##### 批量扫描多个项目
```bash
#!/bin/bash
# 批量扫描脚本
PROJECTS=("/path/to/project1" "/path/to/project2" "/path/to/project3")
RULES="./security-rules.json"
OUTPUT_DIR="./scan-results"

mkdir -p "$OUTPUT_DIR"

for project in "${PROJECTS[@]}"; do
    project_name=$(basename "$project")
    echo "扫描项目: $project_name"
    ./bin/eslint-security-cli -p "$project" -o "$OUTPUT_DIR/${project_name}-results.json" -r "$RULES"
done

# 生成汇总报告
echo "扫描完成，结果保存在: $OUTPUT_DIR"
```
#### � 基本用法（必需参数）
```bash
# 基本扫描（必需提供所有三个参数）
eslint-security-cli -p /path/to/project -o /path/to/results.json -r /path/to/security-rules.json

# 扫描当前目录的src文件夹
eslint-security-cli -p ./src -o ./scan-results.json -r ./security-rules.json

# 使用绝对路径（推荐）
eslint-security-cli -p /Users/yourname/project/src -o /Users/yourname/results/security-report.json -r /Users/yourname/config/security-rules.json
```

#### 📖 参数说明
所有参数都是**必需**的，必须提供完整的项目路径、输出路径和规则配置：

| 参数 | 简写 | 描述 | 示例 |
|------|------|------|------|
| `--project` | `-p` | **必需** - 项目目录路径（绝对路径） | `-p /Users/project/src` |
| `--output` | `-o` | **必需** - 扫描结果输出文件路径（绝对路径） | `-o /Users/project/results.json` |
| `--rules` | `-r` | **必需** - ESLint规则配置文件路径（绝对路径） | `-r /Users/config/security-rules.json` |
| `--version` | `-v` | 显示版本号 | `-v` |
| `--help` | `-h` | 显示帮助信息 | `-h` |

#### ⚠️ 重要提示
- **必须使用绝对路径**：相对路径可能导致不可预期的结果
- **文件必须存在**：规则配置文件必须是有效的JSON文件
- **输出目录必须可写**：确保有权限写入输出文件

#### 📝 配置文件示例
创建一个安全规则配置文件 `security-rules.json`：

```json
{
  "rules": {
    "security/detect-object-injection": "error",
    "security/detect-unsafe-regex": "error",
    "security/detect-eval-with-expression": "error",
    "security/detect-non-literal-fs-filename": "warn",
    "security/detect-pseudoRandomBytes": "error",
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error",
    "no-script-url": "error"
  }
}
```

## 📋 检测的安全问题

| 安全漏洞类型 | 检测规则 | 严重程度 |
|-------------|---------|----------|
| **XSS攻击** | `no-dangerous-html` | 🔴 高危 |
| **ReDoS攻击** | `no-unsafe-regex` | 🔴 高危 |
| **代码注入** | `no-eval`, `no-new-func` | 🔴 高危 |
| **路径遍历** | `no-path-traversal` | 🟡 中危 |
| **敏感数据泄露** | `no-sensitive-data` | 🟡 中危 |
| **弱加密** | `no-weak-crypto` | 🟡 中危 |
| **不安全的随机数** | `no-insecure-random` | 🟢 低危 |
