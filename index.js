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

// 请求统计
let requestStats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageResponseTime: 0
};

// 超时控制的fetch包装函数
async function fetchWithTimeout(url, options, timeoutMs = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`请求超时 (${timeoutMs}ms)`);
    }
    throw error;
  }
}

// 重试机制
async function fetchWithRetry(url, options, maxRetries = 3, delayMs = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchWithTimeout(url, options, options.timeout || 30000);
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        //console.log(`请求失败，${delayMs}ms后重试 (${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2; // 指数退避
      }
    }
  }
  
  throw new Error(`重试${maxRetries}次后仍然失败: ${lastError.message}`);
}

// 检测响应内容类型
function detectResponseType(responseText, contentType) {
  if (contentType && contentType.includes('application/json')) {
    try {
      JSON.parse(responseText);
      return 'json';
    } catch {
      return 'text';
    }
  }
  
  if (contentType && contentType.includes('text/html')) {
    return 'html';
  }
  
  if (contentType && contentType.includes('text/xml')) {
    return 'xml';
  }
  
  // 尝试检测JSON
  try {
    JSON.parse(responseText);
    return 'json';
  } catch {
    // 尝试检测HTML
    if (responseText.trim().startsWith('<') && responseText.includes('>')) {
      return 'html';
    }
    return 'text';
  }
}

// 格式化响应内容
function formatResponse(responseText, responseType) {
  switch (responseType) {
    case 'json':
      try {
        return JSON.stringify(JSON.parse(responseText), null, 2);
      } catch {
        return responseText;
      }
    case 'html':
      // 简化HTML显示，移除多余空白
      return responseText.replace(/\s+/g, ' ').trim();
    default:
      return responseText;
  }
}

// 注册一个名为 "call_url" 的工具 (HTTP请求工具)
server.registerTool("call_url",
  {
    title: "HTTP Request Tool",         // 工具在 UI 中显示的标题
    description: "Performs an HTTP request with advanced features like timeout, retry, and response formatting", // 工具的描述
    inputSchema: { 
      url: z.string(), 
      method: z.string().default("GET"),
      headers: z.record(z.string()).optional(),
      body: z.string().optional(),
      timeout: z.number().min(1000).max(300000).default(30000), // 超时时间(ms)
      maxRetries: z.number().min(0).max(10).default(3), // 最大重试次数
      retryDelay: z.number().min(100).max(10000).default(1000), // 重试延迟(ms)
      followRedirects: z.boolean().default(true), // 是否跟随重定向
      validateSSL: z.boolean().default(true) // 是否验证SSL证书
    } // 定义工具的输入参数 schema，使用 zod 进行类型验证
  },
  // 工具的处理函数，当工具被调用时执行
  // 接收解构的参数 { url, method, headers, body, timeout, maxRetries, retryDelay, followRedirects, validateSSL }
  async ({ url, method = "GET", headers = {}, body, timeout = 30000, maxRetries = 3, retryDelay = 1000, followRedirects = true, validateSSL = true }) => {
    const startTime = Date.now();
    requestStats.totalRequests++;
    
    //console.log(`收到HTTP请求: ${method} ${url}`);
    
    try {
      // 构建fetch选项
      const fetchOptions = {
        method: method.toUpperCase(),
        headers: {
          // 移除默认的Content-Type，让headers参数完全控制
          ...headers
        },
        redirect: followRedirects ? 'follow' : 'manual',
        // 注意：Node.js的fetch不支持rejectUnauthorized选项，这里只是记录
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
      
      // 执行HTTP请求（带重试和超时）
      const response = await fetchWithRetry(url, fetchOptions, maxRetries, retryDelay);
      
      // 获取响应内容
      const responseText = await response.text();
      
      const responseTime = Date.now() - startTime;
      requestStats.successfulRequests++;
      
      // 更新平均响应时间
      requestStats.averageResponseTime = 
        (requestStats.averageResponseTime * (requestStats.successfulRequests - 1) + responseTime) / requestStats.successfulRequests;
      
      //console.log(`请求成功: ${response.status} ${response.statusText} (${responseTime}ms)`);
      
      // 检测响应类型并格式化
      const responseType = detectResponseType(responseText, response.headers.get('content-type'));
      const formattedResponse = formatResponse(responseText, responseType);
      
      // 构建响应头信息
      const responseHeaders = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      
      // 返回响应结果
      return {
        content: [
          { 
            type: "text", 
            text: `HTTP ${response.status} ${response.statusText}
响应时间: ${responseTime}ms
响应类型: ${responseType}
响应大小: ${responseText.length} 字符

响应头:
${JSON.stringify(responseHeaders, null, 2)}

响应内容:
${formattedResponse}` 
          }
        ]
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      requestStats.failedRequests++;
      
      console.error(`请求失败: ${error.message}`);
      
      return {
        content: [
          { 
            type: "text", 
            text: `请求失败: ${error.message}
请求时间: ${responseTime}ms
重试次数: ${maxRetries}
超时设置: ${timeout}ms` 
          }
        ]
      };
    }
  }
);

// 注册统计信息工具
server.registerTool("get_stats",
  {
    title: "HTTP Request Statistics",
    description: "Get statistics about HTTP requests made by this tool",
    inputSchema: {}
  },
  async () => {
    return {
      content: [
        {
          type: "text",
          text: `HTTP请求统计信息:
总请求数: ${requestStats.totalRequests}
成功请求数: ${requestStats.successfulRequests}
失败请求数: ${requestStats.failedRequests}
成功率: ${requestStats.totalRequests > 0 ? ((requestStats.successfulRequests / requestStats.totalRequests) * 100).toFixed(2) : 0}%
平均响应时间: ${requestStats.averageResponseTime.toFixed(2)}ms`
        }
      ]
    };
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