export async function onRequestGet(context) {
    const { env } = context;
    
    // 检查 Secrets 是否被正确加载
    const usernameLoaded = env.ADMIN_USERNAME ? true : false;
    const passwordLoaded = env.ADMIN_PASSWORD ? true : false;
    
    // 返回一个 JSON 响应来查看结果
    return new Response(JSON.stringify({
        message: "Secret Test Result",
        usernameExists: usernameLoaded,
        passwordExists: passwordLoaded,
        // WARNING: NEVER expose real secrets in a live app. This is for debugging only.
        // We will expose the first few characters to check the value.
        usernamePrefix: env.ADMIN_USERNAME ? env.ADMIN_USERNAME.substring(0, 3) : "N/A",
        passwordPrefix: env.ADMIN_PASSWORD ? env.ADMIN_PASSWORD.substring(0, 3) : "N/A"
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}
