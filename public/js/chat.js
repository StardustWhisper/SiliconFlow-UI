// 首先定义loadModelList函数
async function loadModelList() {
    try {
        const response = await fetch('./model.list');
        if (!response.ok) {
            throw new Error(`Failed to load model list: ${response.status} ${response.statusText}`);
        }

        const text = await response.text();
        const modelSelect = document.getElementById('modelSelect');
        const optgroup = modelSelect.querySelector('optgroup');

        // 清空现有选项
        optgroup.innerHTML = '';

        // 解析每一行并添加选项
        const lines = text.split('\n');
        lines.forEach(line => {
            line = line.trim();
            if (line) {
                const [modelName, modelId] = line.split(':').map(s => s.trim());
                if (modelName && modelId) {
                    const option = document.createElement('option');
                    option.value = modelId;
                    option.textContent = modelName;
                    optgroup.appendChild(option);
                }
            }
        });

        if (optgroup.children.length === 0) {
            throw new Error('No models found in model.list');
        }
    } catch (error) {
        console.error('Error loading model list:', error);
        const modelSelect = document.getElementById('modelSelect');
        const optgroup = modelSelect.querySelector('optgroup');
        optgroup.innerHTML = `<option value="" disabled>加载模型列表失败: ${error.message}</option>`;
        throw error; // 重新抛出错误以便外部捕获
    }
}

// 合并所有DOMContentLoaded事件处理
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. 首先加载模型列表
        await loadModelList();
        console.log('Model list loaded successfully');

        // 2. 处理参数面板折叠状态
        const isCollapsed = localStorage.getItem('parametersCollapsed') === 'true';
        const content = document.getElementById('parameterContent');
        const icon = document.querySelector('.toggle-icon');

        if (isCollapsed) {
            content.classList.add('collapsed');
            icon.classList.add('collapsed');
        }

        // 3. 初始化其他UI状态
        const messageInput = document.getElementById('messageInput');
        messageInput.value = '';

        // 4. 创建新会话
        currentSessionId = Date.now();
        currentMessages = [];

        // 5. 加载历史记录
        updateHistoryList();

    } catch (error) {
        console.error('Initialization failed:', error);
    }
});

// 修改发送消息函数
async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const apiKey = localStorage.getItem('apiKey');
    const model = document.getElementById('modelSelect').value;
    const message = messageInput.value.trim();
    const systemPrompt = document.getElementById('systemPrompt').value.trim();

    if (!message) {
        alert('请输入消息');
        return;
    }

    if (!apiKey) {
        alert('请先设置 API Key');
        window.location.href = 'settings.html';
        return;
    }

    // 添加系统提示词（如果存在且是新对话）
    if (systemPrompt && currentMessages.length === 0) {
        currentMessages.push({
            role: 'system',
            content: systemPrompt
        });
    }

    // 添加用户消息到当前会话
    currentMessages.push({
        role: 'user',
        content: message
    });

    // 添加用户消息到显示
    appendMessage(message, 'user');
    messageInput.value = '';

    try {
        const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: currentMessages,
                max_tokens: parseInt(document.getElementById('maxTokens').value),
                temperature: parseFloat(document.getElementById('temperature').value),
                top_p: parseFloat(document.getElementById('topP').value),
                top_k: parseInt(document.getElementById('topK').value),
                frequency_penalty: parseFloat(document.getElementById('frequencyPenalty').value),
                stream: true
            })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let aiMessage = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                    try {
                        const data = JSON.parse(line.slice(6));
                        const content = data.choices[0].delta.content || '';
                        aiMessage += content;
                        updateAIMessage(aiMessage);
                    } catch (e) {
                        console.error('Error parsing chunk:', e);
                    }
                }
            }
        }

        // 添加AI回复到当前会话
        currentMessages.push({
            role: 'assistant',
            content: aiMessage
        });

        // 保存或更新对话记录
        saveHistory(message, aiMessage);
        updateHistoryList();

    } catch (error) {
        console.error('Error:', error);
        appendMessage('发生错误: ' + error.message, 'error');
    }
}
