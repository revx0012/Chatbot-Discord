const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const clearButton = document.getElementById('clear-button');
const toggleButton = document.getElementById('toggle-mode');

const STORAGE_KEY = 'chatbot_history';

// Load chat history from localStorage
const loadHistory = () => {
  const historyJSON = localStorage.getItem(STORAGE_KEY);
  if (historyJSON) {
    try {
      const messages = JSON.parse(historyJSON);
      messages.forEach(({ sender, message }) =>
        addMessage(sender, message, sender === 'You' ? 'user' : 'bot', false)
      );
    } catch (e) {
      console.error('Failed to load chat history:', e);
      localStorage.removeItem(STORAGE_KEY);
    }
  }
};

// Save chat history to localStorage
const saveHistory = () => {
  const messages = [];
  chatBox.querySelectorAll('div').forEach(div => {
    const sender = div.classList.contains('user') ? 'You' : 'Bot';
    // Extract text content only ignoring HTML tags
    const message = div.querySelector('strong').nextSibling.textContent || div.textContent.replace(`${sender}:`, '').trim();
    messages.push({ sender, message });
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
};

const addMessage = (sender, message, senderClass, save = true) => {
  const messageDiv = document.createElement('div');
  messageDiv.className = senderClass;

  // Marked renders HTML from markdown input
  const html = marked.parse(message);
  messageDiv.innerHTML = `<strong>${sender}:</strong><br>${html}`;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (save) saveHistory();
};

const clearChat = () => {
  chatBox.innerHTML = '';
  localStorage.removeItem(STORAGE_KEY);
};

const chatWithBot = async () => {
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  addMessage('You', userMessage, 'user');
  userInput.value = '';
  userInput.focus();

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userMessage }),
    });

    if (!response.ok) throw new Error('Server error');

    const data = await response.json();
    addMessage('Bot', data.response, 'bot');
  } catch (err) {
    addMessage('Bot', 'Error: could not reach the server.', 'bot');
  }
};

sendButton.addEventListener('click', chatWithBot);
userInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') chatWithBot();
});
clearButton.addEventListener('click', clearChat);

// Dark/Light mode toggle
toggleButton.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  toggleButton.textContent = document.body.classList.contains('dark') ? '☀️ Light Mode' : '🌙 Dark Mode';
});

// Load chat history on page load
loadHistory();
userInput.focus();
