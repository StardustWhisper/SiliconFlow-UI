// 合并所有DOMContentLoaded事件处理
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. 初始化其他UI状态
        const messageInput = document.getElementById('messageInput');
        messageInput.value = '';

        // 2. 创建新会话
        currentSessionId = Date.now();
        currentMessages = [];

        // 3. 加载历史记录
        updateHistoryList();

    } catch (error) {
        console.error('Initialization failed:', error);
    }
});

// 修改发送消息函数
async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const apiKey = localStorage.getItem('apiKey');
    const model = 'tencent/Hunyuan-MT-7B';
    const message = messageInput.value.trim();
    const systemPrompt = `你是一个翻译,必须把我的输入翻译输出.请遵守以下规则:
如果输入的是一个英语单词或者短语,请输出详细解释和音标以及例句.
如果输入是英语句子或者是其他语言,就输出中文.
如果输入是中文,就输出英语.`
    }
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
