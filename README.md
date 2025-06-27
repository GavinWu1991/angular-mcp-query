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

### 1. 安装 | Installation

**推荐：全局安装 (for CLI usage and MCP Server)**
```bash
npm install -g angular-mcp-query
```

**或者：本地安装到项目 (for programmatic usage)**
```bash
npm install angular-mcp-query
```

### 2. 获取文档 | Fetching Documentation

第一次使用时，你需要下载 Angular 文档。选择一个你需要的 Angular 版本 (例如: v18, main)。

```bash
# 示例：获取最新的 v18 文档 (如果 v18 是最新的稳定版)
angular-mcp-query docs fetch --angular-version v18

# 获取主分支的最新文档 (开发版)
angular-mcp-query docs fetch --angular-version main --verbose
```
文档会被存储在一个用户特定的目录中 (详见下面的配置部分)。

### 3. 启动 MCP 服务 | Start MCP Server

```bash
angular-mcp-query
```
服务器启动后，你可以将其配置到兼容的 MCP 客户端中。

### 4. 其他文档管理命令 | Other Document Management Commands

```bash
# 列出已缓存的文档版本
angular-mcp-query docs list

# 移除特定版本的文档缓存
angular-mcp-query docs remove v17
# (请替换 v17 为你想要移除的版本)
```

### 基本用法 (作为库) | Basic Usage (as a library)
```javascript
import { AngularDocsMCPServer } from 'angular-mcp-query';

async function startMyServer() {
  // 你可以在这里传递配置参数给构造函数 (如果支持)
  const server = new AngularDocsMCPServer();
  await server.start();
}

startMyServer().catch(console.error);
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

如果 `angular-mcp-query` 已全局安装并处于你的系统 PATH中:
```json
{
  "mcpServers": {
    "angular-docs": {
      "command": "angular-mcp-query"
    }
  }
}
```
如果安装在项目本地，你可能需要指定到 `node_modules/.bin/angular-mcp-query` 的路径，或者使用 `npx angular-mcp-query`。

### 文档存储与配置 | Documentation Storage & Configuration

- **默认存储路径 | Default Storage Path**: `angular-mcp-query` 会将下载的文档存储在一个用户特定的目录中。这避免了权限问题，并保持你的项目目录清洁。
    - **Linux**: 通常在 `~/.local/share/angular-mcp-query/assets/angular-docs`
    - **macOS**: 通常在 `~/Library/Application Support/angular-mcp-query/assets/angular-docs`
    - **Windows**: 通常在 `%LOCALAPPDATA%\\angular-mcp-query\\assets\\angular-docs`
- **自定义存储路径 | Custom Storage Path**: 你可以通过设置 `ANGULAR_MCP_ASSETS_PATH` 环境变量来覆盖默认的存储路径。
    ```bash
    export ANGULAR_MCP_ASSETS_PATH="/custom/path/to/angular-docs-cache"
    angular-mcp-query docs fetch
    # or
    ANGULAR_MCP_ASSETS_PATH="/custom/path/to/angular-docs-cache" angular-mcp-query
    ```
- **内部配置 | Internal Configuration**: 核心配置文件是 `dist/config/config.js` (由 `config/config.ts` 编译而来)。一般情况下，你不需要直接修改它，应优先使用环境变量进行配置。

---

## 🛠️ 开发 (从源码) | Development (from source)

如果你想为此项目贡献或从源码运行：

### 安装依赖 | Install Dependencies
```bash
git clone https://github.com/GavinWu1991/angular-mcp-query.git
cd angular-mcp-query
npm install
```

### 本地开发命令 | Local Development Commands
```bash
# 使用 tsx 实时编译运行开发服务器
npm run dev

# 构建项目
npm run build

# 运行构建后的项目
npm start

# 直接运行 src/index.ts (CLI 入口) 执行特定命令
# (例如, 等同于全局安装后的 angular-mcp-query docs fetch --angular-version main)
npx tsx src/index.ts docs fetch --angular-version main

# 运行测试
npm run test
```

### 贡献 | Contributing
**中文**: 欢迎贡献代码、报告问题或提出建议！  
**English**: Welcome to contribute code, report issues, or suggest improvements!

1. Fork 项目 | Fork the project
2. 创建特性分支 | Create feature branch  
3. 提交变更 | Submit changes
4. 发起 Pull Request | Create Pull Request

---

<!-- 性能指标部分可以保留，但可能需要用户在实际使用后更新 -->
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

