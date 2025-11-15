let basicAuthToken = '';

/** 登录并存储认证 Token */
let bearerToken = ''; // 将变量名改为 bearerToken

/** 登录并存储认证 Token */
function login() {
    // 这里我们只使用密码/Token 字段作为输入
    const token = document.getElementById('password').value; 
    const loginStatus = document.getElementById('login-status');
    const apiSection = document.getElementById('api-section');
    
    // 设置 Bearer Token
    bearerToken = token; 
    
    fetch('/api/login', {
        method: 'POST',
        headers: {
            // 发送 Bearer Token
            'Authorization': `Bearer ${bearerToken}` 
        }
    })
    .then(response => {
        if (response.ok) {
            loginStatus.className = 'success';
            loginStatus.textContent = '登录成功！';
            apiSection.style.display = 'block';
            document.getElementById('login-section').style.display = 'none';
        } else {
            bearerToken = ''; // 清除 token
            loginStatus.className = 'error';
            loginStatus.textContent = '登录失败: ' + response.statusText;
            apiSection.style.display = 'none';
        }
    })
    .catch(error => {
        loginStatus.className = 'error';
        loginStatus.textContent = '网络错误: ' + error;
    });
}

/** 通用 API 调用函数 */
function callApi(path, body, statusElementId) {
    if (!bearerToken) { // 使用 bearerToken 检查
        document.getElementById(statusElementId).textContent = '请先登录。';
        return;
    }

    const statusElement = document.getElementById(statusElementId);
    statusElement.textContent = '发送请求中...';
    statusElement.className = '';

    fetch(`/api/${path}`, {
        method: 'POST',
        headers: {
            // 发送 Bearer Token
            'Authorization': `Bearer ${bearerToken}`, 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    // ... (后续的 .then/.catch 逻辑保持不变)
    .then(response => response.json().then(data => {
        if (response.ok) {
            statusElement.className = 'success';
            statusElement.textContent = `成功 (${response.status}): ${JSON.stringify(data)}`;
        } else {
            statusElement.className = 'error';
            statusElement.textContent = `失败 (${response.status}): ${JSON.stringify(data)}`;
        }
    }))
    .catch(error => {
        statusElement.className = 'error';
        statusElement.textContent = '网络错误: ' + error;
    });
}
// ... (其他函数保持不变)

/** 调用 /api/add */
function addReminder() {
    const body = {
        name: document.getElementById('name').value,
        interval_type: document.getElementById('interval_type').value,
        interval_value: parseInt(document.getElementById('interval_value').value, 10),
        next_due_date: document.getElementById('next_due_date').value
    };
    callApi('add', body, 'add-status');
}

/** 调用 /api/update */
function updateReminder() {
    const body = {
        id: document.getElementById('update_id').value,
        // interval_type 和 interval_value 从 add 表单获取，因为 update 逻辑会根据它们计算新的日期
        interval_type: document.getElementById('interval_type').value,
        interval_value: parseInt(document.getElementById('interval_value').value, 10),
    };
    callApi('update', body, 'update-status');
}
