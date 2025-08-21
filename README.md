# MCP HTTP 请求工具

这是一个 MCP (Model Context Protocol) 工具，用于执行可定制参数的 HTTP 请求。

## 功能特点

- 支持多种 HTTP 方法（GET、POST、PUT、DELETE、PATCH、HEAD）。
- 允许自定义请求头。
- 支持适用于 POST、PUT 和 PATCH 方法的请求体。
- 自动解析 JSON 响应。

## 使用方法

此工具可在 MCP 环境中使用，用于模拟 HTTP 请求，以便进行测试、数据获取或集成。

### 参数：

- `url` (字符串，必填): 发送请求的 URL。
- `method` (选项，必填): 要使用的 HTTP 方法 (GET, POST, PUT, DELETE, PATCH, HEAD)。
- `headers` (JSON，可选): 表示请求头的 JSON 对象。默认值: `{}`。
- `body` (字符串，可选): 请求体（适用于 POST、PUT 和 PATCH 方法）。默认值: `""`。

### 示例（MCP 环境中）：

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

## 本地开发

要在本地运行此工具：

1.  导航到 `MCPHTTPRequest` 目录。
2.  安装依赖项：

    ```bash
    npm install
    ```

3.  然后您可以使用 MCP 客户端或通过直接调用 `index.js` 中的 `run` 函数（仅用于开发目的）来测试该工具。

## 贡献

欢迎通过提交问题或拉取请求来为此项目做出贡献。
