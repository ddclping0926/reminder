let basicAuthToken = '';

/** 登录并存储认证 Token */
function login() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const loginStatus = document.getElementById('login-status');
    const apiSection = document.getElementById('api-section');
    
    // 生成 Base64 编码的 Basic 认证头
    basicAuthToken = btoa(`${user}:${pass}`);
    
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${basicAuthToken}`
        }
    })
    .then(response => {
        if (response.ok) {
            loginStatus.className = 'success';
            loginStatus.textContent = '登录成功！';
            apiSection.style.display = 'block';
            document.getElementById('login-section').style.display = 'none';
        } else {
            basicAuthToken = ''; // 清除 token
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
    if (!basicAuthToken) {
        document.getElementById(statusElementId).textContent = '请先登录。';
        return;
    }

    const statusElement = document.getElementById(statusElementId);
    statusElement.textContent = '发送请求中...';
    statusElement.className = '';

    fetch(`/api/${path}`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${basicAuthToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
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
