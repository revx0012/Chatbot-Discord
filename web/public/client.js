const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const clearButton = document.getElementById('clear-button');

const addMessage = (sender, message) => {
    const messageDiv = document.createElement('div');
    if (sender === 'Bot') {
        // Apply line breaks to AI responses
        const formattedMessage = message.replace(/\n/g, '<br>');
        messageDiv.innerHTML = `<strong>${sender}:</strong><br>${formattedMessage}`;
    } else {
        // Keep user input as-is
        messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    }
    chatBox.appendChild(messageDiv);
};

const clearChat = () => {
    chatBox.innerHTML = ''; // Clear the chat box
};


const chatWithBot = async () => {
    const userMessage = userInput.value;
    if (!userMessage) return;

    addMessage('You', userMessage);
    userInput.value = '';

    const response = await fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userMessage }),
    });

    if (response.ok) {
        const botResponse = await response.json();
        addMessage('Bot', botResponse);
    } else {
        addMessage('Bot', 'Error occurred while processing your request.');
    }
};

clearButton.addEventListener('click', clearChat);
sendButton.addEventListener('click', chatWithBot);
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') chatWithBot();
});
