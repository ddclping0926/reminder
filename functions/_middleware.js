// --- 实用工具函数 ---

/** 强制创建标准的 JSON 响应并添加 CORS 头部 */
function createCorsResponse(body, status = 200) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Content-Type': 'application/json',
    };
    
    const responseBody = (typeof body === 'object' && body !== null) ? JSON.stringify(body) : String(body);

    return new Response(responseBody, { status, headers: corsHeaders });
}

/** 身份验证 (使用 Basic Auth) */
// ...
// ... (所有实用函数保持不变)

// *** Bearer Token 认证逻辑 ***
function authenticate(request, env) {
    const authHeader = request.headers.get('Authorization') || '';
    
    // 检查是否以 Bearer 开头
    if (!authHeader.startsWith('Bearer ')) return false;
    
    // 提取客户端发送的 Token
    const clientToken = authHeader.replace('Bearer ', '').trim();
    
    // 提取 Pages Secret 中的正确 Token，并确保 trim()
    const requiredToken = env.BEARER_TOKEN ? env.BEARER_TOKEN.trim() : '';

    if (!requiredToken) return false;

    // 比较两个 Token
    if (clientToken === requiredToken) {
        return true; 
    }
    return false;
}

// ... (onRequest 中间件处理函数保持不变)
export const onRequest = async (context) => {
    const { request, env, functionPath } = context;

    // 1. OPTIONS 预检请求
    if (request.method === 'OPTIONS') {
        return createCorsResponse('OK', 204); 
    }

    // 2. 身份认证检查
    const isLoginPath = functionPath.includes('/login');

    if (isLoginPath) {
        // 在 Bearer Token 方案中，/login 路径仍然用于测试认证。
        if (authenticate(request, env)) {
            return createCorsResponse({ message: "Login Successful" }, 200);
        }
        return createCorsResponse({ message: "Unauthorized" }, 401);
    } else if (functionPath.startsWith('/api')) {
        // 所有其他 /api/* 路径都需要认证
        if (!authenticate(request, env)) {
             return createCorsResponse({ message: "Authentication Required" }, 401);
        }
    }
    
    return context.next();
};
// ...

// --- 中间件处理函数 ---
export const onRequest = async (context) => {
    const { request, env, functionPath } = context;

    // --- 1. 预检请求 (OPTIONS) 必须处理 ---
    if (request.method === 'OPTIONS') {
        // 确保 CORS 头部存在
        return createCorsResponse('OK', 204); 
    }

    // --- 2. 身份认证检查 ---
    // 只有 /api/login 路径用于登录认证，其他所有路径都需要认证通过
    const isLoginPath = functionPath.includes('/login');

    if (isLoginPath) {
        // /api/login: 检查认证结果并响应
        if (authenticate(request, env)) {
            return createCorsResponse({ message: "Login Successful" }, 200);
        }
        return createCorsResponse({ message: "Unauthorized" }, 401);
    } else if (functionPath.startsWith('/api')) {
        // 所有其他 /api/* 路径都需要认证
        if (!authenticate(request, env)) {
             return createCorsResponse({ message: "Authentication Required" }, 401);
        }
    }
    
    // 如果认证通过或不是 API 路径，继续执行下一个函数
    return context.next();
};
