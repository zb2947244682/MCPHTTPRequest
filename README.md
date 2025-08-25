# MCP HTTP 请求工具

## 📖 项目介绍

这是一个简单的 MCP (Model Context Protocol) 工具，用于执行可定制参数的 HTTP 请求。它旨在提供一个灵活的方式来模拟各种 HTTP 通信，包括自定义请求头和请求体，并自动解析 JSON 响应。

**NPM 仓库地址:** [`@zb2947244682/mcp-http-requester`](https://www.npmjs.com/package/@zb2947244682/mcp-http-requester)

## 🚀 核心功能

此 MCP 服务提供了强大的 HTTP 请求工具：

### `httpRequest` 工具

执行 HTTP 请求，支持完整的 HTTP 方法集和自定义参数。

#### 参数说明

| 参数 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|--------|------|
| `url` | 字符串 | ✅ | - | 目标请求URL |
| `method` | 字符串 | ✅ | - | HTTP方法 (GET, POST, PUT, DELETE, PATCH, HEAD) |
| `headers` | JSON字符串 | ❌ | `{}` | 自定义请求头 |
| `body` | 字符串 | ❌ | `""` | 请求体内容 (适用于 POST, PUT, PATCH 方法) |

#### 使用示例

```json
{
  "tool": "httpRequest",
  "parameters": {
    "url": "https://api.example.com/data",
    "method": "POST",
    "headers": "{\"Content-Type\": \"application/json\", \"Authorization\": \"Bearer YOUR_TOKEN\"}",
    "body": "{\"key\": \"value\"}"
  }
}
```

## ⚙️ 配置说明

### 在 Cursor 中配置

将以下配置添加到您的 Cursor `mcp.json` 文件中：

```json
{
  "mcp-http-requester": {
    "command": "npx",
    "args": [
      "-y",
      "@zb2947244682/mcp-http-requester"
    ]
  }
}
```

### 通过 npx 直接运行

您可以通过以下命令直接从命令行运行此 MCP 项目：

```bash
npx @zb2947244682/mcp-http-requester@latest
```

## 本地开发配置

如果您在本地开发环境中使用，可以将以下配置添加到您的 Cursor `mcp.json` 文件中：

```json
{
  "mcp-http-requester": {
    "command": "node",
    "args": ["D:\\Codes\\MCPRepo\\mcp-http-requester\\index.js"]
  }
}
```

## 📋 支持的方法

- **GET** - 获取资源
- **POST** - 创建资源
- **PUT** - 更新资源
- **DELETE** - 删除资源
- **PATCH** - 部分更新资源
- **HEAD** - 获取响应头信息

## 🔧 特性

- ✅ 支持所有常用 HTTP 方法
- ✅ 自定义请求头配置
- ✅ 灵活的请求体设置
- ✅ 自动 JSON 响应解析
- ✅ 简单易用的配置
- ✅ 通过 npx 快速部署
