# 🚀 Angular MCP Query

**中文** | **English**

> **智能 Angular 文档 MCP 服务，支持自动版本检测和智能缓存，消除 AI 代码生成幻觉**  
> **Intelligent Angular documentation MCP server with auto version detection & smart caching to eliminate AI code generation hallucinations**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP](https://img.shields.io/badge/MCP-Compatible-blue.svg)](https://modelcontextprotocol.io)

---

## ✨ 核心特性 | Key Features

### 🎯 智能版本管理 | Smart Version Management
- **中文**: 自动检测项目 Angular 版本，按主版本分组存储，增量更新策略
- **English**: Auto-detect project Angular version, group by major versions, incremental update strategy

### 🔍 强大的文档搜索 | Powerful Documentation Search  
- **中文**: 语义化搜索，智能匹配相关内容，按分类浏览，精准的相关性评分
- **English**: Semantic search, intelligent content matching, category browsing, precise relevance scoring

### 🛠️ 灵活的使用方式 | Flexible Usage Patterns
- **中文**: MCP 服务器与 AI 助手无缝集成，独立 CLI 工具，程序化 API 调用
- **English**: MCP server seamlessly integrates with AI assistants, standalone CLI tools, programmatic API access

### ⚡ 高性能缓存 | High-Performance Caching
- **中文**: 本地文档缓存，智能缓存策略，高效的增量同步机制
- **English**: Local documentation cache, intelligent caching strategy, efficient incremental sync

---

## 🚀 快速开始 | Quick Start

### 安装 | Installation

```bash
# 克隆项目 | Clone repository
git clone https://github.com/your-username/angular-mcp-query.git
cd angular-mcp-query

# 安装依赖 | Install dependencies
npm install

# 获取文档 | Fetch documentation
npm run fetch

# 启动服务 | Start MCP server
npm start
```

### 基本用法 | Basic Usage

```bash
# 检测项目版本 | Detect project version
npm run docs:detect

# 列出缓存版本 | List cached versions  
npm run docs:list

# 搜索文档 | Search documentation
# (通过 MCP 客户端 | via MCP client)
```

---

## 📚 使用场景 | Use Cases

<table>
<tr>
<th>🤖 AI 代码生成增强<br/>AI Code Generation Enhancement</th>
<th>👨‍💻 开发者工具<br/>Developer Tools</th>
</tr>
<tr>
<td>
<strong>中文:</strong> 为 AI 助手提供准确的 Angular 文档上下文，减少代码生成幻觉，确保符合版本最佳实践<br/>
<strong>English:</strong> Provide accurate Angular documentation context for AI assistants, reduce generation hallucinations, ensure version best practices
</td>
<td>
<strong>中文:</strong> 快速查找组件和 API 文档，离线访问，项目特定版本文档<br/>
<strong>English:</strong> Quick component and API lookup, offline access, project-specific version docs
</td>
</tr>
</table>

### 🔧 CI/CD 集成 | CI/CD Integration
- **中文**: 自动化文档同步，版本兼容性检查，团队文档一致性保证
- **English**: Automated doc sync, version compatibility checks, team documentation consistency

---

## 🏗️ 项目架构 | Project Architecture

```
src/
├── core/           # 核心工具库 | Core utilities
├── mcp/           # MCP 服务器 | MCP server implementation
├── tools/         # 独立工具 | Standalone tools
└── index.js       # 主入口 | Main entry point
```

**详细架构说明 | Detailed architecture**: [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

---

## 📖 支持的版本 | Supported Versions

| Angular Version | 支持状态 Support | 说明 Description |
|-----------------|------------------|-------------------|
| v15.x | ✅ | 稳定版本 Stable |
| v16.x | ✅ | 稳定版本 Stable |
| v17.x | ✅ | 稳定版本 Stable | 
| v18.x | ✅ | LTS 版本 LTS |
| v19.x | ✅ | 最新稳定版 Latest Stable |
| v20.x | ✅ | 开发版本 Development |

### 文档分类 | Documentation Categories
- **Components** - 组件、指令、管道 | Components, directives, pipes
- **Concepts** - 核心概念、架构 | Core concepts, architecture  
- **CLI** - 命令行工具 | Command line tools
- **API** - API 参考 | API reference
- **Tutorials** - 教程指南 | Tutorial guides

---

## ⚙️ 配置 | Configuration

### MCP 客户端配置 | MCP Client Configuration

**Claude Desktop**:
```json
{
  "mcpServers": {
    "angular-docs": {
      "command": "node",
      "args": ["src/index.js"],
      "cwd": "/path/to/angular-mcp-query"
    }
  }
}
```

### 项目配置 | Project Configuration
**配置文件 | Config file**: `config/config.js`
- 文档存储路径 | Documentation storage path
- 版本管理策略 | Version management strategy
- 搜索行为配置 | Search behavior settings
- 缓存策略设置 | Cache strategy configuration

---

## 🛠️ 开发 | Development

### 本地开发 | Local Development
```bash
npm run dev        # 开发模式 | Development mode
npm run test       # 运行测试 | Run tests
npm run fetch      # 获取文档 | Fetch documentation
```

### 贡献 | Contributing
**中文**: 欢迎贡献代码、报告问题或提出建议！  
**English**: Welcome to contribute code, report issues, or suggest improvements!

1. Fork 项目 | Fork the project
2. 创建特性分支 | Create feature branch  
3. 提交变更 | Submit changes
4. 发起 Pull Request | Create Pull Request

---

## 📊 性能指标 | Performance Metrics

| 操作 Operation | 首次 First Time | 增量 Incremental |
|---------------|-----------------|-------------------|
| 文档获取 Doc Fetch | ~30s | ~5s |
| 查询响应 Query Response | <100ms | <50ms |
| 搜索性能 Search Performance | ~200ms | ~100ms |

---

## 📄 许可证 | License

**MIT License** - 详见 LICENSE 文件 | See LICENSE file for details

## 🙏 致谢 | Acknowledgments

- **Angular Team** - 优秀的框架和文档 | Excellent framework and documentation
- **MCP Protocol** - 强大的 AI 集成协议 | Powerful AI integration protocol  
- **开源社区 | Open Source Community** - 支持和贡献 | Support and contributions

---

## 📞 联系方式 | Contact

- **GitHub Issues** - 问题报告 | Bug reports
- **Discussions** - 技术讨论 | Technical discussions
- **Pull Requests** - 代码贡献 | Code contributions

---

**让 AI 生成更精准的 Angular 代码，从准确的文档开始！**  
**Start generating more accurate Angular code with AI by providing precise documentation context!**

> **项目目标 | Project Goal**: 解决 AI 代码生成中的文档不准确问题，提供实时、准确的 Angular 文档上下文  
> **Project Goal**: Solve documentation inaccuracy issues in AI code generation by providing real-time, accurate Angular documentation context

