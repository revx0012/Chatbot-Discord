const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

let GradioClient; // Will hold the imported Gradio Client class
let gradioClient; // The connected Gradio client instance

// Dynamically import the @gradio/client ES module
async function loadGradioClient() {
  try {
    const mod = await import('@gradio/client');
    GradioClient = mod.Client;
    console.log('Gradio client module loaded.');
  } catch (err) {
    console.error('Failed to load Gradio client module:', err);
    process.exit(1);
  }
}

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const prefix = '!';
const ownerId = config.owner_id;
const systemPromptFile = 'rules.txt';
const channelsFile = path.join(__dirname, 'channels.json');

let allowedChannels = {};
if (fs.existsSync(channelsFile)) {
  allowedChannels = JSON.parse(fs.readFileSync(channelsFile, 'utf-8'));
}

function splitMessage(text, maxLength = 2000) {
  const parts = [];
  let remaining = text;
  while (remaining.length > maxLength) {
    let splitIndex = remaining.lastIndexOf('\n', maxLength);
    if (splitIndex === -1) splitIndex = remaining.lastIndexOf(' ', maxLength);
    if (splitIndex === -1) splitIndex = maxLength;

    parts.push(remaining.slice(0, splitIndex));
    remaining = remaining.slice(splitIndex).trimStart();
  }
  parts.push(remaining);
  return parts;
}

async function initGradio() {
  if (!GradioClient) {
    await loadGradioClient();
  }

  let systemPrompt = '';
  try {
    systemPrompt = fs.readFileSync(systemPromptFile, 'utf-8').replace(/[\r\n]+/g, ' ').trim();
  } catch (err) {
    console.error(`Error reading ${systemPromptFile}:`, err);
  }

  console.log('Connecting to Gradio...');
  gradioClient = await GradioClient.connect(config.space);
  console.log('Connected to Gradio.');

  return systemPrompt;
}

let systemPrompt = '';

bot.once('ready', async () => {
  console.log(`Logged in as ${bot.user.tag}`);
  systemPrompt = await initGradio();
});

bot.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const isDM = message.channel.type === 1;
  const content = message.content.trim();

  if (!content.startsWith(prefix)) {
    if (!isDM && !allowedChannels[message.channel.id]) return;

    await message.channel.sendTyping();

    try {
      const result = await gradioClient.predict('/chat', {
        message: content,
        system_message: systemPrompt,
        max_tokens: 4096,
        temperature: 0.7,
        top_p: 0.9,
      });

      const response = result.data?.[0] || 'No response';

      const messages = splitMessage(response);
      for (const msgPart of messages) {
        await message.channel.sendTyping();
        await message.reply(msgPart);
      }
    } catch (err) {
      console.error('Gradio error:', err);
      message.reply('Error talking to AI.');
    }

    return;
  }

  const args = content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'chatbot') {
    if (args[0] === 'remove') {
      if (message.author.id !== ownerId) return message.reply('Only the owner can remove.');
      delete allowedChannels[message.channel.id];
      fs.writeFileSync(channelsFile, JSON.stringify(allowedChannels, null, 2));
      return message.reply('This channel is no longer a chatbot channel.');
    }

    allowedChannels[message.channel.id] = true;
    fs.writeFileSync(channelsFile, JSON.stringify(allowedChannels, null, 2));
    return message.reply('This channel is now enabled for chatbot.');
  }

  if (command === 'restart') {
    if (message.author.id !== ownerId) return;
    message.reply('Restarting...').then(() => process.exit(0));
  }

  if (command === 'ruleadd') {
    if (message.author.id !== ownerId) return;
    const rule = content.slice(prefix.length + 7).trim();
    if (!rule) return message.reply('No rule specified.');

    fs.appendFileSync('rules.txt', `\n${rule}`);
    message.reply('Rule added. Restart required to apply.');
  }
});

bot.login(config.token);
