# 🚀 Angular MCP Query

> 智能 Angular 文档 MCP 服务，支持自动版本检测和智能缓存，消除 AI 代码生成幻觉

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP](https://img.shields.io/badge/MCP-Compatible-blue.svg)](https://modelcontextprotocol.io)

[**English**](./README.md) | **中文** 

> **详细中文文档** - 本文档提供完整的中文使用指南和技术说明

---

## ✨ 核心特性

### 🎯 **智能版本管理**
- **自动检测项目 Angular 版本** - 从 package.json 和 angular.json 自动识别
- **主版本分组存储** - 按 v15、v16、v17 等主版本号组织文档
- **增量更新策略** - 仅在新的小版本发布时智能更新

### 🔍 **强大的文档搜索**
- **语义化搜索** - 智能匹配相关内容，支持中英文搜索
- **分类浏览** - 按组件、CLI、API、概念、教程等分类
- **相关性评分** - 基于标题、内容、标签的精准排序算法

### 🛠️ **灵活的使用方式**
- **MCP 服务器** - 与 Claude、GPT 等 AI 助手无缝集成
- **独立 CLI 工具** - 可单独使用的命令行工具
- **程序化 API** - 支持在代码中直接调用核心功能

### ⚡ **高性能缓存**
- **本地文档缓存** - 毫秒级响应速度
- **智能缓存策略** - 平衡存储空间和访问速度
- **增量同步** - 高效的文档更新机制，避免重复下载

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- npm 或 yarn
- Git（用于克隆 Angular 文档仓库）

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/angular-mcp-query.git
cd angular-mcp-query
```

2. **安装依赖**
```bash
npm install
```

3. **获取 Angular 文档**
```bash
# 获取最新版本文档
npm run fetch

# 或获取特定版本
npm run fetch -- --angular-version v18.0.0
```

4. **启动 MCP 服务器**
```bash
npm start
```

### 独立工具使用

```bash
# 检测当前项目的 Angular 版本
npm run docs:detect

# 列出所有缓存的版本
npm run docs:list

# 获取特定版本文档
npm run fetch -- --angular-version v18.0.0

# 强制刷新文档缓存
npm run fetch:force
```

## 📚 主要使用场景

### 🤖 **增强 AI 代码生成**
当使用 Claude、GPT 等 AI 助手生成 Angular 代码时：

- **提供准确的文档上下文** - 确保 AI 获得最新、准确的 Angular 文档信息
- **减少代码生成幻觉** - 避免 AI 生成过时或不存在的 API 用法
- **版本兼容性保证** - 自动匹配项目使用的 Angular 版本

### 👨‍💻 **开发者日常工具**

- **快速查找文档** - 无需打开浏览器即可搜索 Angular 文档
- **离线文档访问** - 本地缓存支持离线开发
- **项目特定版本** - 自动匹配项目使用的 Angular 版本文档

### 🔧 **CI/CD 集成**

- **自动化文档同步** - GitHub Actions 自动获取最新文档
- **版本兼容性检查** - 确保团队使用一致的文档版本
- **构建流程集成** - 可集成到项目构建和部署流程中

## 🏗️ 项目架构

```
src/
├── core/                    # 核心工具库
│   ├── version-manager.js   # 版本管理
│   ├── document-loader.js   # 文档加载与搜索
│   └── index.js            # 统一导出
├── mcp/                    # MCP 服务器
│   ├── server.js           # 主服务器类
│   └── index.js            # MCP 导出
├── tools/                  # 独立工具
│   └── doc-fetcher/        # 文档获取工具
│       ├── fetcher.js      # 核心获取逻辑
│       ├── cli.js          # 命令行接口
│       └── index.js        # 工具导出
└── index.js                # 主入口文件
```

详细架构说明：[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

## 📖 支持的 Angular 版本

| Angular 版本 | 支持状态 | 说明 |
|-------------|---------|------|
| v15.x | ✅ 完全支持 | 稳定版本 |
| v16.x | ✅ 完全支持 | 稳定版本 |
| v17.x | ✅ 完全支持 | 稳定版本 |
| v18.x | ✅ 完全支持 | 当前 LTS |
| v19.x | ✅ 完全支持 | 最新稳定版 |
| v20.x | ✅ 完全支持 | 最新开发版 |

### 文档分类支持

- **组件 (Components)** - Angular 组件、指令、管道
- **概念 (Concepts)** - 核心概念、架构、依赖注入
- **CLI** - Angular CLI 命令、配置、工具链
- **API** - API 参考、类定义、接口文档
- **教程 (Tutorials)** - 入门指南、示例应用
- **未分类** - 其他文档文件

## 🔧 高级配置

### 配置文件：`config/config.js`

```javascript
export const config = {
  github: {
    owner: 'angular',
    repo: 'angular',
    contentPath: 'adev/src/content',  // 文档路径
  },
  storage: {
    assetsPath: './assets/angular-docs',  // 本地存储路径
    cacheValidityHours: 24,               // 缓存有效期
  },
  organization: {
    categories: {
      // 文档分类规则配置
    }
  },
  mcp: {
    name: 'angular-docs',
    version: '0.1.0'
  }
};
```

### 环境变量配置

```bash
# 设置文档存储路径
ANGULAR_DOCS_PATH=/custom/path/to/docs

# 设置缓存策略
CACHE_VALIDITY_HOURS=48

# 生产环境
NODE_ENV=production
```

## 🔌 MCP 客户端配置

### Claude Desktop 配置

在 `~/AppData/Roaming/Claude/claude_desktop_config.json` 中添加：

```json
{
  "mcpServers": {
    "angular-docs": {
      "command": "node",
      "args": ["src/index.js"],
      "cwd": "/path/to/angular-mcp-query",
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### 其他 MCP 客户端

项目兼容所有支持 MCP 协议的客户端，包括：
- Claude Desktop
- 自定义 MCP 客户端
- VS Code 扩展
- 其他 AI 助手工具

## 📊 性能特点

### 缓存性能
- **首次获取**：~30秒（完整克隆仓库）
- **增量更新**：~5秒（仅更新变更文件）
- **查询响应**：<100ms（本地缓存）
- **搜索性能**：~200ms（1000+ 文档）

### 存储优化
- **压缩存储**：自动压缩 markdown 文件
- **智能索引**：高效的搜索索引
- **版本去重**：共享公共文档内容

## 🛠️ 开发指南

### 本地开发

```bash
# 开发模式（自动重启）
npm run dev

# 调试模式
DEBUG=angular-mcp:* npm start

# 运行测试
npm test
```

### 添加新功能

1. **添加新的搜索分类**
```javascript
// config/config.js
categories: {
  'new-category': {
    patterns: ['new-pattern'],
    description: '新分类描述'
  }
}
```

2. **扩展版本检测**
```javascript
// src/core/version-manager.js
static async detectCustomVersion(projectPath) {
  // 自定义版本检测逻辑
}
```

### 测试

```bash
# 单元测试
npm run test:unit

# 集成测试
npm run test:integration

# 覆盖率报告
npm run test:coverage
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 报告问题
- 使用 GitHub Issues 报告 bug
- 提供详细的复现步骤
- 包含系统环境信息

### 提交代码
1. Fork 项目到你的 GitHub
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交变更：`git commit -m 'Add amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

### 代码规范
- 使用 ESLint 进行代码检查
- 遵循现有的代码风格
- 添加必要的注释和文档
- 保持测试覆盖率

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- **Angular 团队** - 提供优秀的框架和详细的文档
- **MCP 协议** - 强大的模型上下文协议
- **开源社区** - 各种优秀的开源工具和库
- **贡献者们** - 所有为项目做出贡献的开发者

## 📞 联系我们

- **GitHub Issues** - 报告问题和功能请求
- **Discussions** - 技术讨论和问答
- **Email** - 技术支持和商务合作

---

**让 AI 生成更精准的 Angular 代码，从准确的文档开始！**

> 这个项目旨在解决 AI 代码生成中常见的文档不准确问题，通过提供实时、准确的 Angular 文档上下文，帮助开发者获得更好的 AI 编程体验。 