#!/usr/bin/env node
// 导入 MCP (Model Context Protocol) Server 和 ResourceTemplate 类，用于创建 MCP 服务和定义资源模板
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// 导入 StdioServerTransport 类，用于通过标准输入/输出 (stdio) 进行通信
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
// 导入 zod 库，用于定义和验证数据 schema (输入参数的类型和结构)
import { z } from "zod";

import fetch from 'node-fetch';

// 创建一个 MCP 服务器实例
const server = new McpServer({
  name: "http-request-server",
  version: "1.0.0"
});

// 注册一个名为 "httpRequest" 的工具
server.registerTool("httpRequest",
  {
    title: "HTTP Request Tool",
    description: "Performs an HTTP request with customizable parameters.",
    inputSchema: {
      url: z.string().url("Invalid URL"),
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD']),
      headers: z.string().optional().default("{}"),
      body: z.string().optional().default(""),
    }
  },
  async ({ url, method, headers, body }) => {
    try {
      const options = {
        method,
        headers: JSON.parse(headers),
      };

      if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
        options.body = body;
      }

      const response = await fetch(url, options);
      const responseText = await response.text();
      let responseJson = null;

      try {
        responseJson = JSON.parse(responseText);
      } catch (e) {
        // Not a JSON response
      }

      return {
        content: [{ type: "json", json: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseJson || responseText,
        }}]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

// 创建一个 StdioServerTransport 实例
const transport = new StdioServerTransport();
// 将 MCP 服务器连接到传输层
server.connect(transport).then(() => {
  console.log("HTTP Request MCP server is running...");
}).catch(error => {
  console.error("Failed to start MCP server:", error);
});