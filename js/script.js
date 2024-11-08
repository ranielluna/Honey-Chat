const OPENAI_API_KEY = 'your-openai-api-key';
const GEMINI_API_KEY = 'your-gemini-api-key';
const GROQ_API_KEY = 'your-groq-api-key';

const translations = {
  'pt-BR': {
    newChat: 'Novo Chat',
    today: 'Hoje',
    previousDays: 'Últimos 7 dias',
    settings: 'Configurações',
    apiSettings: 'Configurações de API',
    enterOpenAIKey: 'Digite sua chave de API do OpenAI',
    enterGeminiKey: 'Digite sua chave de API do Gemini',
    enterGroqKey: 'Digite sua chave de API do Groq',
    saveSettings: 'Salvar Configurações',
    typeMessage: 'Digite sua mensagem aqui...',
    welcome: 'Olá! Sou seu assistente AI. Como posso ajudar você hoje?',
    thinking: 'Pensando...',
    error: 'Desculpe, houve um erro ao processar sua solicitação.',
    setApiKey: 'Por favor, configure sua chave de API nas configurações',
    deleteChat: 'Excluir chat',
    confirmDelete: 'Tem certeza que deseja excluir este chat?',
    clearAllChats: 'Limpar Todos os Chats',
    confirmClearAll: 'Tem certeza que deseja excluir todos os chats?',
    theme: 'Tema',
    light: 'Claro',
    dark: 'Escuro'
  },
  'en': {
    newChat: 'New Chat',
    today: 'Today',
    previousDays: 'Previous 7 Days',
    settings: 'Settings',
    apiSettings: 'API Settings',
    enterOpenAIKey: 'Enter your OpenAI API key',
    enterGeminiKey: 'Enter your Gemini API key',
    enterGroqKey: 'Enter your Groq API key',
    saveSettings: 'Save Settings',
    typeMessage: 'Type your message here...',
    welcome: 'Hello! I\'m your AI assistant. How can I help you today?',
    thinking: 'Thinking...',
    error: 'Sorry, there was an error processing your request.',
    setApiKey: 'Please set your API key in settings',
    deleteChat: 'Delete chat',
    confirmDelete: 'Are you sure you want to delete this chat?',
    clearAllChats: 'Clear All Chats',
    confirmClearAll: 'Are you sure you want to delete all chats?',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark'
  }
};

class ChatInterface {
  constructor() {
    this.chats = JSON.parse(localStorage.getItem('chats')) || [];
    this.currentChatId = null;

    this.chatContainer = document.querySelector('.chat-container');
    this.messageInput = document.querySelector('.message-input');
    this.currentModel = 'gpt';
    this.currentLanguage = localStorage.getItem('language') || 'pt-BR';
    this.languageSelect = document.getElementById('language-select');
    this.languageSelect.value = this.currentLanguage;
    this.currentTheme = localStorage.getItem('theme') || 'light';
    this.themeSelect = document.getElementById('theme-select');
    this.themeSelect.value = this.currentTheme;

    if (this.currentTheme === 'dark') {
      document.body.classList.add('dark-mode');
    }

    if (this.chats.length === 0) {
      this.startNewChat(true);
    } else {
      this.loadChat(this.chats[0].id);
      this.updateChatHistory();
    }

    this.sendButton = document.querySelector('.send-btn');
    this.modelButtons = document.querySelectorAll('.model-btn');
    this.newChatButton = document.querySelector('.new-chat-btn');
    this.clearAllChatsButton = document.querySelector('.clear-all-chats-btn');
    this.chatHistory = document.querySelector('.chat-history');
    this.settingsButton = document.querySelector('.settings-btn');
    this.settingsModal = document.querySelector('.settings-modal');
    this.closeSettings = document.querySelector('.close-settings');
    this.saveSettings = document.querySelector('.save-settings');
    this.openaiKeyInput = document.getElementById('openai-key');
    this.geminiKeyInput = document.getElementById('gemini-key');
    this.groqKeyInput = document.getElementById('groq-key');
    this.hamburgerMenu = document.querySelector('.hamburger-menu');
    this.closeSidebarBtn = document.querySelector('.close-sidebar');
    this.sidebar = document.querySelector('.sidebar');
    this.mobileOverlay = document.querySelector('.mobile-overlay');

    this.loadApiKeys();
    this.updateUILanguage();
    this.initializeEventListeners();
    this.initializeExistingChatItems();
    
    this.hamburgerMenu.addEventListener('click', () => {
      this.sidebar.classList.add('show');
      this.mobileOverlay.classList.add('show');
      this.hamburgerMenu.classList.add('hide');
      this.closeSidebarBtn.classList.add('show');
    });

    this.closeSidebarBtn.addEventListener('click', () => {
      this.sidebar.classList.remove('show');
      this.mobileOverlay.classList.remove('show');
      this.hamburgerMenu.classList.remove('hide');
      this.closeSidebarBtn.classList.remove('show');
    });

    this.mobileOverlay.addEventListener('click', () => {
      this.sidebar.classList.remove('show');
      this.mobileOverlay.classList.remove('show');
      this.hamburgerMenu.classList.remove('hide');
      this.closeSidebarBtn.classList.remove('show');
    });

    this.chatHistory.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        this.sidebar.classList.remove('show');
        this.mobileOverlay.classList.remove('show'); 
        this.hamburgerMenu.classList.remove('hide');
        this.closeSidebarBtn.classList.remove('show');
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        this.sidebar.classList.remove('show');
        this.mobileOverlay.classList.remove('show');
        this.hamburgerMenu.classList.remove('hide');
        this.closeSidebarBtn.classList.remove('show');
      }
    });

    this.debouncedSave = this.debounce(() => {
      this.saveChats();
    }, 300);
  }

  saveChats() {
    localStorage.setItem('chats', JSON.stringify(this.chats));
  }

  startNewChat(isInitial = false) {
    const chatId = Date.now().toString();
    const newChat = {
      id: chatId,
      title: translations[this.currentLanguage].newChat,
      messages: []
    };
    
    if (!isInitial || this.chats.length === 0) {
      this.chats.unshift(newChat);
      this.saveChats();
      this.updateChatHistory();
    }
    
    this.currentChatId = chatId;
    this.chatContainer.innerHTML = '';
    
    document.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
    const newChatItem = document.querySelector(`.chat-item[data-chat-id="${chatId}"]`);
    if (newChatItem) {
      newChatItem.classList.add('active');
    }
}

  clearAllChats() {
    if (confirm(translations[this.currentLanguage].confirmClearAll)) {
      this.chats = [];
      this.saveChats();
      this.updateChatHistory();
      this.chatContainer.innerHTML = '';
      this.startNewChat();
    }
  }

  loadChat(chatId) {
    const chat = this.chats.find(c => c.id === chatId);
    if (chat) {
      this.currentChatId = chatId;
      
      this.chatContainer.textContent = '';
      const fragment = document.createDocumentFragment();

      chat.messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${msg.type}-message`);
        messageDiv.textContent = msg.content;
        fragment.appendChild(messageDiv);
      });
      
      this.chatContainer.appendChild(fragment);
      
      document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.toggle('active', item.dataset.chatId === chatId);
      });
    }
  }

  addMessageToChat(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${type}-message`);
    messageDiv.textContent = message;
    
    requestAnimationFrame(() => {
      this.chatContainer.appendChild(messageDiv);
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    });

    if (this.currentChatId) {
      const chat = this.chats.find(c => c.id === this.currentChatId);
      if (chat) {
        if (type === 'user' && chat.messages.length === 0) {
          chat.title = message.slice(0, 30) + (message.length > 30 ? '...' : '');
          this.updateChatHistory();
        }
        chat.messages.push({ content: message, type });
        this.debouncedSave();
      }
    }

    return messageDiv;
  }

  createChatItem(title, chatId) {
    const newChatItem = document.createElement('div');
    newChatItem.classList.add('chat-item');
    newChatItem.setAttribute('data-chat-id', chatId);
    
    if (chatId === this.currentChatId) {
      newChatItem.classList.add('active');
    }

    newChatItem.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span>${title}</span>
      <button class="delete-chat">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"></path>
        </svg>
      </button>
    `;

    newChatItem.addEventListener('click', (e) => {
      if (!e.target.closest('.delete-chat')) {
        this.loadChat(chatId);
      }
    });

    const deleteBtn = newChatItem.querySelector('.delete-chat');
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      this.deleteChat(chatId);
    };

    return newChatItem;
  }

  deleteChat(chatId) {
    if (confirm(translations[this.currentLanguage].confirmDelete)) {
      this.chats = this.chats.filter(c => c.id !== chatId);
      this.saveChats();
      this.updateChatHistory();
      
      if (chatId === this.currentChatId) {
        this.chatContainer.innerHTML = '';
        
        if (this.chats.length > 0) {
          this.loadChat(this.chats[0].id);
        } else {
          this.startNewChat();
        }
      }
    }
  }

  updateChatHistory() {
    const todayGroup = document.querySelector('.history-group');
    todayGroup.innerHTML = `<div class="history-date">${translations[this.currentLanguage].today}</div>`;
    
    this.chats.forEach(chat => {
      const chatItem = this.createChatItem(chat.title, chat.id);
      todayGroup.appendChild(chatItem);
    });
  }

  initializeEventListeners() {
    this.sendButton.addEventListener('click', () => this.sendMessage());
    this.messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    this.modelButtons.forEach(button => {
      button.addEventListener('click', () => this.switchModel(button));
    });

    this.newChatButton.addEventListener('click', () => this.startNewChat());
    this.clearAllChatsButton.addEventListener('click', () => this.clearAllChats());
    this.settingsButton.addEventListener('click', () => {
      this.settingsModal.style.display = 'flex';
    });

    this.closeSettings.addEventListener('click', () => {
      this.settingsModal.style.display = 'none';
    });

    this.settingsModal.addEventListener('click', (e) => {
      if (e.target === this.settingsModal) {
        this.settingsModal.style.display = 'none';
      }
    });

    this.saveSettings.addEventListener('click', () => {
      this.saveApiKeys();
      this.settingsModal.style.display = 'none';
    });

    this.languageSelect.addEventListener('change', () => {
      this.currentLanguage = this.languageSelect.value;
      localStorage.setItem('language', this.currentLanguage);
      this.updateUILanguage();
    });

    this.themeSelect.addEventListener('change', (e) => {
      this.currentTheme = e.target.value;
      localStorage.setItem('theme', this.currentTheme);
      
      if (this.currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    });
  }

  updateUILanguage() {
    const t = translations[this.currentLanguage];
    if (!t) return;

    const newChatBtn = document.querySelector('.new-chat-btn span');
    if (newChatBtn) newChatBtn.textContent = t.newChat;

    const clearAllChatsBtn = document.querySelector('.clear-all-chats-btn span');
    if (clearAllChatsBtn) clearAllChatsBtn.textContent = t.clearAllChats;

    const historyDates = document.querySelectorAll('.history-date');
    if (historyDates[0]) historyDates[0].textContent = t.today;

    const settingsBtn = document.querySelector('.settings-btn span');
    if (settingsBtn) settingsBtn.textContent = t.settings;

    const settingsHeader = document.querySelector('.settings-header h2');
    if (settingsHeader) settingsHeader.textContent = t.apiSettings;

    const messageInput = document.querySelector('.message-input');
    if (messageInput) messageInput.placeholder = t.typeMessage;

    const openaiKey = document.querySelector('#openai-key');
    if (openaiKey) openaiKey.placeholder = t.enterOpenAIKey;

    const geminiKey = document.querySelector('#gemini-key');
    if (geminiKey) geminiKey.placeholder = t.enterGeminiKey;

    const groqKey = document.querySelector('#groq-key');
    if (groqKey) groqKey.placeholder = t.enterGroqKey;

    const saveSettings = document.querySelector('.save-settings');
    if (saveSettings) saveSettings.textContent = t.saveSettings;

    const themeLabel = document.querySelector('label[for="theme-select"]');
    if (themeLabel) themeLabel.textContent = t.theme;

    const themeSelect = document.getElementById('theme-select');
    if (themeSelect && themeSelect.options.length >= 2) {
        themeSelect.options[0].textContent = t.light;
        themeSelect.options[1].textContent = t.dark;
    }
  }

  switchModel(button) {
    this.modelButtons.forEach(btn => btn.classList.remove('active'));
    
    button.classList.add('active');
    
    this.currentModel = button.dataset.model;

    if (window.innerWidth <= 768) {
      this.sidebar.classList.remove('show');
      this.mobileOverlay.classList.remove('show');
      this.hamburgerMenu.classList.remove('hide');
      this.closeSidebarBtn.classList.remove('show');
    }
  }
  
  async sendMessage() {
    const message = this.messageInput.value.trim();
    if (!message) return;

    this.addMessageToChat(message, 'user');
    this.messageInput.value = '';

    const t = translations[this.currentLanguage];
    const loadingMessage = this.addMessageToChat(t.thinking, 'ai');

    try {
      let response;
      switch(this.currentModel) {
        case 'gpt':
          response = await this.callChatGPT(message);
          break;
        case 'gemini':
          response = await this.callGemini(message);
          break;
        case 'groq':
          response = await this.callGroq(message);
          break;
      }

      loadingMessage.textContent = response;
    } catch (error) {
      loadingMessage.textContent = t.error;
      console.error('Error:', error);
    }
  }

  async callChatGPT(message) {
    const apiKey = localStorage.getItem('openai-api-key');
    if (!apiKey) {
      throw new Error(translations[this.currentLanguage].setApiKey);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'user',
          content: message
        }]
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async callGemini(message) {
    const apiKey = localStorage.getItem('gemini-api-key');
    if (!apiKey) {
      throw new Error(translations[this.currentLanguage].setApiKey);
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: message
          }]
        }]
      })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  async callGroq(message) {
    const apiKey = localStorage.getItem('groq-key');
    if (!apiKey) {
      throw new Error(translations[this.currentLanguage].setApiKey);
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [{
          role: 'user',
          content: message
        }],
        temperature: 0.7,
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }

  initializeExistingChatItems() {
    const existingChatItems = document.querySelectorAll('.chat-item');
    existingChatItems.forEach(item => {
      const deleteBtn = item.querySelector('.delete-chat');
      if (deleteBtn) {
        deleteBtn.onclick = (e) => {
          e.stopPropagation();
          if (confirm(translations[this.currentLanguage].confirmDelete)) {
            item.remove();
          }
        };
      }
    });
  }

  loadApiKeys() {
    const openaiKey = localStorage.getItem('openai-api-key');
    const geminiKey = localStorage.getItem('gemini-api-key');
    const groqKey = localStorage.getItem('groq-key');
    
    if (openaiKey) this.openaiKeyInput.value = openaiKey;
    if (geminiKey) this.geminiKeyInput.value = geminiKey;
    if (groqKey) this.groqKeyInput.value = groqKey;
  }

  saveApiKeys() {
    const openaiKey = this.openaiKeyInput.value.trim();
    const geminiKey = this.geminiKeyInput.value.trim();
    const groqKey = this.groqKeyInput.value.trim();
    
    if (openaiKey) localStorage.setItem('openai-api-key', openaiKey);
    if (geminiKey) localStorage.setItem('gemini-api-key', geminiKey);
    if (groqKey) localStorage.setItem('groq-key', groqKey);
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.chatInterface = new ChatInterface();
});