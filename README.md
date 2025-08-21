# MCP HTTP 请求工具

## 项目介绍

这是一个简单的 MCP (Model Context Protocol) 工具，用于执行可定制参数的 HTTP 请求。它旨在提供一个灵活的方式来模拟各种 HTTP 通信，包括自定义请求头和请求体，并自动解析 JSON 响应。

**NPM 仓库地址:** `https://www.npmjs.com/package/@zb2947244682/mcp-http-request`

## 项目功能

此 MCP 服务提供了以下 HTTP 请求工具：

- `httpRequest`: 执行 HTTP 请求，支持以下参数：`url` (字符串，必填), `method` (选项，必填，可选值包括 GET, POST, PUT, DELETE, PATCH, HEAD), `headers` (JSON 字符串，可选，默认为`{}`), `body` (字符串，可选，适用于 POST, PUT, PATCH 方法，默认为`""`)。例如：`{"tool": "httpRequest", "parameters": {"url": "https://api.example.com/data", "method": "POST", "headers": "{\"Content-Type\": \"application/json\", \"Authorization\": \"Bearer YOUR_TOKEN\"}", "body": "{\"key\": \"value\"}"}}`

## 如何配置到 Cursor 中

将以下配置添加到您的 Cursor `mcp.json` 文件中：

```json
{
  // ... 其他现有配置 ...
  "mcp-http-request": {
    "command": "npx",
    "args": [
      "-y",
      "@zb2947244682/mcp-http-request"
    ]
  }
}
```

# 通过 npx 运行

您可以通过以下单行命令直接从命令行运行此 MCP 项目：

```bash
npx @zb2947244682/mcp-http-request
```
