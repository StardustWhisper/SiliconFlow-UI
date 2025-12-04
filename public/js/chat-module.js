// 主题切换功能
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.checked = savedTheme === 'dark';

    themeToggle.addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });
});

// 配置 marked 选项
marked.setOptions({
    breaks: true,        // 支持 GitHub 风格的换行
    gfm: true,          // 启用 GitHub 风格的 Markdown
    headerIds: false,    // 禁用标题 ID
    mangle: false,      // 禁用标题 ID 转义
    sanitize: false,    // 允许 HTML 标签
    highlight: function(code, lang) {
        // 如果需要代码高亮，可以在这里集成 highlight.js 等库
        return code;
    }
});

// 添加会话ID和消息数组
let currentSessionId = Date.now();
let currentMessages = [];

// 添加滑块值更新
const sliders = ['temperature', 'topP', 'topK', 'frequencyPenalty'];
sliders.forEach(id => {
    const slider = document.getElementById(id);
    if (!slider) {
        return;
    }

    const value = document.getElementById(`${id}Value`);
    slider.addEventListener('input', () => {
        value.textContent = slider.value;
    });
});

// 添加滚动进度指示器更新函数
function updateScrollIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const indicator = document.getElementById('scrollIndicator');

    const scrollPercent = (chatMessages.scrollTop / (chatMessages.scrollHeight - chatMessages.clientHeight)) * 100;
    indicator.style.height = `${scrollPercent}%`;
}

// 修改滚动函数
function scrollToBottom(smooth = true) {
    const chatMessages = document.getElementById('chatMessages');
    const messagesContainer = document.getElementById('messagesContainer');

    const scrollHeight = messagesContainer.scrollHeight;
    const clientHeight = chatMessages.clientHeight;
    const maxScroll = scrollHeight - clientHeight;

    if (smooth) {
        chatMessages.scrollTo({
            top: maxScroll,
            behavior: 'smooth'
        });
    } else {
        chatMessages.scrollTop = maxScroll;
    }

    updateScrollIndicator();
}

// 修改消息追加函数
function appendMessage(content, type) {
    const messagesContainer = document.getElementById('messagesContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;

    if (type === 'user') {
        messageDiv.textContent = content;
        const copyButtons = createCopyButtons(content);
        messageDiv.appendChild(copyButtons);
    } else if (type === 'ai') {
        messageDiv.innerHTML = marked.parse(content);
        const copyButtons = createCopyButtons(content, true);
        messageDiv.appendChild(copyButtons);
    } else {
        messageDiv.textContent = content;
    }

    messagesContainer.appendChild(messageDiv);
    scrollToBottom(true);
    updateScrollIndicator();
}

// 修改 AI 消息更新函数
function updateAIMessage(content) {
    const messagesContainer = document.getElementById('messagesContainer');
    let aiMessage = messagesContainer.querySelector('.ai-message:last-child');

    if (!aiMessage) {
        aiMessage = document.createElement('div');
        aiMessage.className = 'message ai-message';
        messagesContainer.appendChild(aiMessage);
    }

    aiMessage.innerHTML = marked.parse(content);

    let copyButtons = aiMessage.querySelector('.copy-buttons');
    if (copyButtons) {
        copyButtons.remove();
    }
    copyButtons = createCopyButtons(content, true);
    aiMessage.appendChild(copyButtons);

    scrollToBottom(false);
}

function createCopyButtons(content, isMarkdown = false) {
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'copy-buttons';

    // 复制纯文本按钮
    const copyTextButton = document.createElement('button');
    copyTextButton.className = 'copy-button';
    copyTextButton.innerHTML = '📋 <span class="tooltip">复制纯文本</span>';
    copyTextButton.onclick = (e) => {
        e.stopPropagation();
        const textContent = stripMarkdown(content);
        copyToClipboard(textContent);
        showCopyTooltip(copyTextButton, '已复制纯文本！');
    };

    // 复制 Markdown 按钮
    const copyMarkdownButton = document.createElement('button');
    copyMarkdownButton.className = 'copy-button';
    copyMarkdownButton.innerHTML = '📝 <span class="tooltip">复制 Markdown</span>';
    copyMarkdownButton.onclick = (e) => {
        e.stopPropagation();
        copyToClipboard(content);
        showCopyTooltip(copyMarkdownButton, '已复制 Markdown！');
    };

    buttonsContainer.appendChild(copyTextButton);
    buttonsContainer.appendChild(copyMarkdownButton);
    return buttonsContainer;
}

function stripMarkdown(text) {
    // 更彻底地移除 Markdown 语法
    return text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')           // 链接
        .replace(/[*_~`]/g, '')                            // 强调语法
        .replace(/^#+\s*/gm, '')                           // 标题
        .replace(/^\s*[-*+]\s+/gm, '')                     // 无序列表
        .replace(/^\s*\d+\.\s+/gm, '')                     // 有序列表
        .replace(/^\s*>/gm, '')                            // 引用
        .replace(/`{3}[\s\S]*?`{3}/gm, '')                // 代码块
        .replace(/`([^`]+)`/g, '$1')                       // 行内代码
        .replace(/\|[^\n]+\|/g, '')                        // 表格
        .replace(/^[-=]{3,}/gm, '')                        // 分隔线
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')         // 图片
        .replace(/\n{2,}/g, '\n\n')                        // 多余的换行
        .replace(/\[([\sx])\]/g, '')                       // 任务列表
        .replace(/~~([^~]+)~~/g, '$1')                     // 删除线
        .replace(/<[^>]+>/g, '')                           // HTML 标签
        .trim();
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        console.error('复制失败:', err);
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

function showCopyTooltip(button, message) {
    const tooltip = button.querySelector('.tooltip');
    const originalText = tooltip.textContent;
    tooltip.textContent = message;
    tooltip.style.display = 'block';

    setTimeout(() => {
        tooltip.textContent = originalText;
        tooltip.style.display = 'none';
    }, 1500);
}

// 修改保存历史记录函数
function saveHistory(userMessage, aiMessage) {
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');

    // 检查是否已存在相同的会话ID
    const existingIndex = history.findIndex(item => item.id === currentSessionId);

    const historyItem = {
        id: currentSessionId,
        time: new Date().toISOString(),
        messages: currentMessages,
        preview: userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : '')
    };

    if (existingIndex !== -1) {
        // 更新现有会话
        history[existingIndex] = historyItem;
    } else {
        // 添加新会话
        history.unshift(historyItem);
        // 只保留最近的20条记录
        if (history.length > 20) {
            history.pop();
        }
    }

    localStorage.setItem('chatHistory', JSON.stringify(history));
}

// 修改显示历史对话函数
function showHistoryChat(encodedItem) {
    const item = JSON.parse(decodeURIComponent(encodedItem));
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.innerHTML = '';

    // 更新当前会话ID和消息
    currentSessionId = item.id;
    currentMessages = [...item.messages];

    // 显示所有消息
    item.messages.forEach(msg => {
        appendMessage(msg.content, msg.role === 'user' ? 'user' : 'ai');
    });

    scrollToBottom(false);  // 加载历史记录时使用即时滚动
}

// 修改删除历史记录函数
function deleteHistoryItem(id) {
    if (confirm('确定要删除这条对话记录吗？')) {
        const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        const newHistory = history.filter(item => item.id !== id);
        localStorage.setItem('chatHistory', JSON.stringify(newHistory));

        // 如果删除的是当前会话，清空聊天区域
        if (id === currentSessionId) {
            const messagesContainer = document.getElementById('messagesContainer');
            messagesContainer.innerHTML = '';
            currentMessages = [];
            currentSessionId = Date.now();
        }

        updateHistoryList();
    }
}

// 修改更新历史记录列表函数
function updateHistoryList() {
    const historyList = document.getElementById('historyList');
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');

    historyList.innerHTML = history.map(item => {
        const time = new Date(item.time).toLocaleString();
        return `
            <div class="history-item" data-id="${item.id}">
                <div class="content" onclick="showHistoryChat('${encodeURIComponent(JSON.stringify(item))}')">
                    <div class="preview">${item.preview}</div>
                    <div class="time">${time}</div>
                </div>
                <button class="delete-btn" onclick="event.stopPropagation(); deleteHistoryItem(${item.id});">🗑️</button>
            </div>
        `;
    }).join('');
}

function toggleParameters() {
    const content = document.getElementById('parameterContent');
    const icon = document.querySelector('.toggle-icon');
    const isCollapsed = content.classList.contains('collapsed');

    if (isCollapsed) {
        content.classList.remove('collapsed');
        icon.classList.remove('collapsed');
    } else {
        content.classList.add('collapsed');
        icon.classList.add('collapsed');
    }

    localStorage.setItem('parametersCollapsed', !isCollapsed);
}

// 清空所有历史记录
function clearAllHistory() {
    if (confirm('确定要清空所有聊天记录吗？此操作不可恢复。')) {
        // 清空 localStorage 中的历史记录
        localStorage.removeItem('chatHistory');

        // 清空历史记录列表
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';

        // 清空当前会话
        currentMessages = [];
        currentSessionId = Date.now();

        // 清空消息显示区域
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.innerHTML = '';
    }
}

function startNewChat() {
    // 清空当前会话
    currentMessages = [];
    currentSessionId = Date.now();

    // 清空消息显示区域
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.innerHTML = '';

    // 清空输入框
    const messageInput = document.getElementById('messageInput');
    messageInput.value = '';

    // 可选：滚动到顶部
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = 0;
}
