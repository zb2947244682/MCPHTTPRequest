#!/usr/bin/env node
// 导入 MCP (Model Context Protocol) Server 类，用于创建 MCP 服务
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// 导入 StdioServerTransport 类，用于通过标准输入/输出 (stdio) 进行通信
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
// 导入 zod 库，用于定义和验证数据 schema (输入参数的类型和结构)
import { z } from "zod";

//console.log("正在启动 MCP HTTP 请求服务器...");

// 创建一个 MCP 服务器实例
// 配置服务器的名称和版本
const server = new McpServer({
  name: "http-request-server", // 服务器名称
  version: "1.0.0"     // 服务器版本
});

//console.log("MCP 服务器实例已创建");

// 注册一个名为 "call_url" 的工具 (HTTP请求工具)
server.registerTool("call_url",
  {
    title: "HTTP Request Tool",         // 工具在 UI 中显示的标题
    description: "Performs an HTTP request", // 工具的描述
    inputSchema: { 
      url: z.string(), 
      method: z.string().default("GET"),
      headers: z.record(z.string()).optional(),
      body: z.string().optional()
    } // 定义工具的输入参数 schema，使用 zod 进行类型验证
  },
  // 工具的处理函数，当工具被调用时执行
  // 接收解构的参数 { url, method, headers, body }
  async ({ url, method = "GET", headers = {}, body }) => {
    //console.log(`收到HTTP请求: ${method} ${url}`);
    
    try {
      // 构建fetch选项
      const fetchOptions = {
        method: method.toUpperCase(),
        headers: {
          // 移除默认的Content-Type，让headers参数完全控制
          ...headers
        }
      };
      
      // 如果有请求体，添加到选项中
      if (body && method !== "GET" && method !== "HEAD") {
        fetchOptions.body = body;
        
        // 如果没有设置Content-Type，则根据body类型自动设置
        if (!headers['content-type'] && !headers['Content-Type']) {
          if (body.startsWith('{') || body.startsWith('[')) {
            // 看起来像JSON
            fetchOptions.headers['Content-Type'] = 'application/json';
          } else if (body.includes('=') && body.includes('&')) {
            // 看起来像form-urlencoded
            fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
          } else {
            // 默认为text/plain
            fetchOptions.headers['Content-Type'] = 'text/plain';
          }
        }
      }
      
      //console.log("正在执行fetch请求...");
      //console.log("请求选项:", JSON.stringify(fetchOptions, null, 2));
      
      // 执行HTTP请求
      const response = await fetch(url, fetchOptions);
      
      // 获取响应内容
      const responseText = await response.text();
      
      //console.log(`请求成功: ${response.status} ${response.statusText}`);
      
      // 返回响应结果
      return {
        content: [
          { 
            type: "text", 
            text: `HTTP ${response.status} ${response.statusText}\n\n响应内容:\n${responseText}` 
          }
        ]
      };
      
    } catch (error) {
      console.error(`请求失败: ${error.message}`);
      
      return {
        content: [
          { 
            type: "text", 
            text: `请求失败: ${error.message}` 
          }
        ]
      };
    }
  }
);

//console.log("HTTP请求工具已注册");

// 创建一个 StdioServerTransport 实例
const transport = new StdioServerTransport();
//console.log("传输层已创建");

// 将 MCP 服务器连接到传输层
// await 确保在连接建立完成后才继续执行后续代码 (例如打印日志)
await server.connect(transport);
// 连接成功后打印日志，表示服务器已在运行
//console.log("OK");
//console.log("MCP HTTP请求服务器已启动并正在运行");