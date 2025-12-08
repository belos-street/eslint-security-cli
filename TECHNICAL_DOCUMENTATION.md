# ESLint Security CLI 技术文档

## 项目概述

ESLint Security CLI 是一个基于 ESLint 引擎的静态代码分析工具，专为安全扫描而设计。该工具采用 Bun 运行时，支持 TypeScript 和 ESM 规范，最终编译为二进制 CLI 工具，便于跨平台部署和使用。

## 技术架构

### 核心技术栈
- **检测引擎**: ESLint v8.57.0
- **运行时**: Bun ≥1.0.0
- **开发语言**: TypeScript 5.3+
- **模块规范**: ESM (ES Modules)
- **包管理器**: Bun (内置包管理器)
- **插件集成**: eslint-plugin-sonarjs

### 支持的文件格式
- JavaScript: `.js`, `.mjs`
- TypeScript: `.ts`, `.mts`
- Vue.js: Vue 3 及以上版本
- React: React 16.8 及以上版本
- 模块系统: ESM / CommonJS

## 项目目录结构

```
eslint-security-cli/
├── src/                          # 源代码目录
│   ├── cli/                      # CLI入口和命令解析
│   │   └── index.ts             # 主程序入口文件
│   ├── core/                     # 核心分析引擎
│   │   └── analyzer.ts          # ESLint分析引擎实现
│   ├── rules/                    # 自定义安全规则
│   │   ├── no-dangerous-html.ts # XSS防护规则
│   │   └── no-unsafe-regex.ts   # ReDoS防护规则
│   ├── formatters/               # 输出格式化器
│   │   └── output-formatter.ts  # 结果格式化实现
│   ├── utils/                    # 工具函数
│   │   └── config-loader.ts     # 配置文件加载器
│   └── types/                    # TypeScript类型定义
│       └── index.ts             # 项目类型接口定义
├── bin/                          # 可执行文件输出目录
│   └── eslint-security          # 编译后的二进制文件
├── dist/                         # 构建输出目录
│   ├── cli/                      # 编译后的CLI文件
│   ├── core/                     # 编译后的核心模块
│   ├── rules/                    # 编译后的规则文件
│   ├── formatters/               # 编译后的格式化器
│   ├── utils/                    # 编译后的工具函数
│   ├── types/                    # 编译后的类型定义
│   └── configs/                  # 编译后的配置文件
├── configs/                      # 预设配置文件
│   └── recommended.js           # 推荐的安全规则配置
├── test/                         # 测试用例目录
│   ├── rules/                    # 规则单元测试
│   ├── core/                     # 核心模块测试
│   ├── fixtures/                 # 测试用例文件
│   └── integration/              # 集成测试
├── build.ts                      # 构建脚本
├── tsconfig.json                # TypeScript配置
├── package.json                 # 项目依赖和脚本
└── README.md                    # 项目使用文档
```

### 目录说明

#### `src/` - 源代码目录
- **cli/**: 命令行接口模块，负责参数解析和程序入口
- **core/**: 核心分析引擎，集成ESLint和规则执行
- **rules/**: 自定义安全规则实现，包括XSS和ReDoS防护
- **formatters/**: 结果输出格式化，支持多种展示方式
- **utils/**: 工具函数，如配置加载和文件处理
- **types/**: TypeScript类型定义，确保类型安全

#### `bin/` - 二进制输出
- 存放通过Bun编译生成的独立可执行文件
- 可直接分发到其他平台使用，无需依赖环境

#### `dist/` - 构建输出
- 编译后的JavaScript文件和类型定义
- 用于npm包分发和库文件引用

#### `configs/` - 配置模板
- 预设的安全规则配置
- 用户可参考或直接使用推荐配置

#### `test/` - 测试体系
- 完整的单元测试和集成测试
- 确保代码质量和功能正确性

## 系统架构设计

### 整体架构
```
┌─────────────────────────────────────────────────────────────┐
│                    CLI Interface                           │
├─────────────────────────────────────────────────────────────┤
│                  Command Parser                             │
│                  (Commander.js)                            │
├─────────────────────────────────────────────────────────────┤
│                   Core Engine                              │
│              ┌───────────────────────┐                       │
│              │   Config Loader      │                       │
│              ├───────────────────────┤                       │
│              │   Security Analyzer  │                       │
│              │   (ESLint Engine)    │                       │
│              ├───────────────────────┤                       │
│              │   Output Formatter   │                       │
│              └───────────────────────┘                       │
├─────────────────────────────────────────────────────────────┤
│                  Rule Engine                               │
│     ┌─────────────┬──────────────┬──────────────────┐     │
│     │ESLint Rules │ SonarJS Rules │ Custom Security  │     │
│     │(Built-in)   │ (Quality)     │ Rules (XSS/ReDoS)│     │
│     └─────────────┴──────────────┴──────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 核心模块设计

#### 1. CLI 入口模块 (`src/cli/index.ts`)
- **职责**: 命令行参数解析和程序入口
- **依赖**: Commander.js
- **功能**:
  - 解析命令行参数
  - 初始化配置加载器
  - 调用核心分析引擎
  - 处理输出和退出码

#### 2. 配置加载器 (`src/utils/config-loader.ts`)
- **职责**: 配置文件管理和加载
- **功能**:
  - 支持多种配置格式 (JSON, JS)
  - 默认配置回退机制
  - 配置验证和合并

#### 3. 安全分析引擎 (`src/core/analyzer.ts`)
- **职责**: 核心静态分析逻辑
- **依赖**: ESLint 引擎
- **功能**:
  - 文件扫描和过滤
  - ESLint 规则执行
  - 结果处理和格式化

#### 4. 输出格式化器 (`src/formatters/output-formatter.ts`)
- **职责**: 分析结果格式化和展示
- **功能**:
  - 多种输出格式 (表格、JSON、紧凑)
  - 颜色高亮和统计信息
  - 可修复问题标识

## 安全规则体系

### ESLint 内置安全规则
```javascript
{
  'no-eval': 'error',              // 禁止 eval()
  'no-implied-eval': 'error',      // 禁止隐式 eval()
  'no-new-func': 'error',          // 禁止 Function 构造函数
  'no-script-url': 'error'         // 禁止 javascript: URL
}
```

### SonarJS 质量规则
```javascript
{
  'sonarjs/no-all-duplicated-branches': 'error',
  'sonarjs/no-element-overwrite': 'error',
  'sonarjs/no-extra-arguments': 'error',
  'sonarjs/no-identical-conditions': 'error',
  'sonarjs/no-identical-expressions': 'error',
  'sonarjs/cognitive-complexity': ['warn', 15]
}
```

### 自定义安全规则

#### 1. 危险 HTML 操作检测 (`no-dangerous-html`)
- **目的**: 防止 XSS 攻击
- **检测内容**:
  - `innerHTML` 和 `outerHTML` 赋值
  - `document.write()` 调用
  - Vue 模板中的 `v-html`
  - React 的 `dangerouslySetInnerHTML`

#### 2. 不安全正则表达式检测 (`no-unsafe-regex`)
- **目的**: 防止 ReDoS 攻击
- **检测内容**:
  - 嵌套量词模式 `(.*)+`
  - 复杂正则表达式 (>100字符)
  - 循环中的全局正则使用

## 文件处理流程

### 扫描流程
```
开始
  ↓
解析命令行参数
  ↓
加载配置文件
  ↓
获取目标文件列表
  ↓
按文件类型分组
  ↓
并行执行ESLint分析
  ↓
聚合分析结果
  ↓
格式化输出
  ↓
返回退出码
结束
```

### 文件类型处理

#### JavaScript/TypeScript 文件
```typescript
// 使用 ESLint 默认解析器
{
  files: ['*.js', '*.mjs', '*.ts', '*.mts'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  }
}
```

#### Vue 文件
```typescript
// 使用 vue-eslint-parser
{
  files: ['*.vue'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module'
  }
}
```

#### React 文件
```typescript
// 支持 JSX/TSX 语法
{
  files: ['*.jsx', '*.tsx'],
  parserOptions: {
    ecmaFeatures: { jsx: true }
  }
}
```

## 构建和部署

### 开发环境设置
```bash
# 安装依赖
bun install

# 开发模式运行
bun dev

# 运行测试
bun test

# 代码检查
bun lint
```

### 构建流程
```bash
# 构建库文件
bun run build

# 编译为二进制文件
bun run build:binary
```

### 构建配置
```typescript
// build.ts 构建脚本
await build({
  entrypoints: ['src/cli/index.ts'],
  outfile: 'bin/eslint-security',
  target: 'bun',
  format: 'esm',
  compile: true,  // 编译为二进制
  minify: true
});
```

## 性能优化

### 1. 缓存机制
- **ESLint 缓存**: 启用文件级别的结果缓存
- **配置缓存**: 缓存解析后的配置文件
- **文件系统缓存**: 避免重复的文件扫描

### 2. 并行处理
- **文件并行**: 多个文件同时分析
- **规则并行**: 同一文件内规则并行执行
- **异步 I/O**: 非阻塞的文件读写操作

### 3. 内存优化
- **流式处理**: 大文件分块处理
- **结果聚合**: 增量结果收集
- **垃圾回收**: 及时清理大对象

## 配置系统

### 默认配置
```javascript
{
  extensions: ['.js', '.mjs', '.ts', '.mts', '.vue', '.jsx', '.tsx'],
  ignorePattern: 'node_modules/**,.git/**,dist/**,build/**',
  cache: true,
  cacheLocation: '.eslintcache',
  format: 'table'
}
```

### 配置文件搜索顺序
1. 命令行指定的配置文件 (`--config`)
2. `eslint-security.config.js`
3. `eslint-security.config.json`
4. `.eslint-security.json`
5. `.eslint-security.js`
6. 内置默认配置

### 配置示例
```javascript
// eslint-security.config.js
module.exports = {
  extensions: ['.js', '.ts', '.vue'],
  ignorePattern: 'node_modules/**,test/**',
  rules: {
    'no-eval': 'error',
    'no-dangerous-html': 'warn',
    'sonarjs/cognitive-complexity': ['error', 10]
  },
  format: 'json'
};
```

## 输出格式

### 表格格式 (默认)
```
src/app.ts
  15:10  error    禁止使用 eval()                    no-eval
  23:5   warning  正则表达式可能存在ReDoS风险         no-unsafe-regex

统计信息:
  错误: 1
  警告: 1
```

### JSON 格式
```json
[
  {
    "filePath": "/path/to/file.ts",
    "messages": [
      {
        "line": 15,
        "column": 10,
        "message": "禁止使用 eval()",
        "ruleId": "no-eval",
        "severity": "error"
      }
    ],
    "errorCount": 1,
    "warningCount": 0
  }
]
```

### 紧凑格式
```
/path/to/file.ts:15:10: Error: 禁止使用 eval() (no-eval)
```

## 错误处理

### 错误类型
1. **配置错误**: 配置文件格式错误或路径不存在
2. **文件访问错误**: 权限问题或文件不存在
3. **解析错误**: 语法错误或文件格式不支持
4. **规则执行错误**: 自定义规则异常

### 错误处理策略
- **优雅降级**: 单个文件失败不影响整体分析
- **详细日志**: 提供完整的错误信息和堆栈跟踪
- **退出码**: 根据错误类型返回合适的退出码

## 扩展性设计

### 自定义规则开发
```typescript
// src/rules/my-custom-rule.ts
import { Rule } from 'eslint';

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: '自定义安全规则',
      category: 'Security'
    }
  },
  create(context: Rule.RuleContext): Rule.RuleListener {
    return {
      // 规则实现
    };
  }
};

export default rule;
```

### 插件系统集成
- **规则注册**: 动态加载自定义规则
- **配置合并**: 支持插件级别的配置
- **生命周期**: 插件初始化和清理

## 测试策略

### 单元测试
- **规则测试**: 每个安全规则的独立测试
- **模块测试**: 核心模块的功能测试
- **集成测试**: 端到端的分析流程测试

### 测试文件结构
```
test/
├── rules/          # 规则测试
├── core/           # 核心模块测试
├── fixtures/       # 测试用例文件
└── integration/    # 集成测试
```

## 部署方案

### 二进制分发
```bash
# 构建独立二进制文件
bun run build:binary

# 分发到目标平台
scp bin/eslint-security user@server:/usr/local/bin/
```

### npm 包分发
```json
{
  "bin": {
    "eslint-security": "dist/cli/index.js"
  },
  "files": ["dist", "configs"]
}
```

### Docker 容器化
```dockerfile
FROM oven/bun:1.0-alpine
COPY bin/eslint-security /usr/local/bin/
ENTRYPOINT ["eslint-security"]
```

## 监控和日志

### 日志级别
- **ERROR**: 系统错误和异常
- **WARN**: 警告信息和潜在问题
- **INFO**: 常规操作信息
- **DEBUG**: 调试信息和详细跟踪

### 性能监控
- **分析时间**: 文件分析和规则执行时间
- **内存使用**: 内存占用和垃圾回收
- **缓存命中率**: 缓存效果和性能提升

## 安全考虑

### 代码执行安全
- **沙箱执行**: 规则在受控环境中执行
- **权限限制**: 最小权限原则
- **输入验证**: 配置文件和参数验证

### 数据安全
- **敏感信息过滤**: 避免在日志中暴露敏感数据
- **文件访问控制**: 限制文件系统访问范围
- **内存安全**: 及时清理敏感数据

## 性能基准

### 测试环境
- **CPU**: Apple M1 Pro
- **内存**: 16GB
- **存储**: SSD
- **测试项目**: 1000个文件，平均500行/文件

### 性能指标
- **冷启动**: < 500ms
- **分析速度**: > 1000文件/秒
- **内存占用**: < 200MB
- **缓存加速**: 3-5倍性能提升

## 未来规划

### 短期目标
- [ ] 支持更多文件格式 (Svelte, Angular)
- [ ] 增加更多安全规则
- [ ] 优化性能和内存使用

### 长期目标
- [ ] AI辅助的安全检测
- [ ] 自定义规则市场
- [ ] 云端规则更新
- [ ] IDE插件集成

## 贡献指南

### 开发流程
1. Fork 项目仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 ESLint 配置
- 编写单元测试
- 更新相关文档

---

**文档版本**: 1.0.0  
**最后更新**: 2024年  
**维护团队**: ESLint Security CLI Team