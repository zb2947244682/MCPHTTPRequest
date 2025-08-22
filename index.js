#!/usr/bin/env node
// 导入 MCP (Model Context Protocol) Server 类，用于创建 MCP 服务
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// 导入 StdioServerTransport 类，用于通过标准输入/输出 (stdio) 进行通信
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
// 导入 zod 库，用于定义和验证数据 schema (输入参数的类型和结构)
import { z } from "zod";

// 创建一个 MCP 服务器实例
// 配置服务器的名称和版本
const server = new McpServer({
  name: "http-request-server", // 服务器名称
  version: "1.0.0"     // 服务器版本
});

// 注册一个名为 "call_url" 的工具 (HTTP请求工具)
server.registerTool("call_url",
  {
    title: "HTTP Request Tool",         // 工具在 UI 中显示的标题
    description: "Performs an HTTP request", // 工具的描述
    inputSchema: { url: z.string(), method: z.string() } // 定义工具的输入参数 schema，使用 zod 进行类型验证
  },
  // 工具的处理函数，当工具被调用时执行
  // 接收解构的参数 { url, method }
  async ({ url, method }) => ({
    // 返回一个包含结果内容的对象
    content: [{ type: "text", text: `Request to ${url} with method ${method}` }] // 先返回简单文本测试
  })
);


// 创建一个 StdioServerTransport 实例
const transport = new StdioServerTransport();
// 将 MCP 服务器连接到传输层
// await 确保在连接建立完成后才继续执行后续代码 (例如打印日志)
await server.connect(transport);
// 连接成功后打印日志，表示服务器已在运行
console.log("Calculator MCP server is running...");