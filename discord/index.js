// index.js
const { Client, GatewayIntentBits } = require('discord.js');
const { Client: GradioClient } = require('@gradio/client');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const prefix = '!';
const ownerId = config.owner_id; // Your Discord user ID
const systemPrompt = config.system_prompt;

let gradioClient;
let allowedChannels = {};
const channelsFile = path.join(__dirname, 'channels.json');

if (fs.existsSync(channelsFile)) {
  allowedChannels = JSON.parse(fs.readFileSync(channelsFile, 'utf-8'));
}

async function initGradio() {
  console.log('Connecting to Gradio...');
  gradioClient = await GradioClient.connect(config.space);
  console.log('Connected.');
}

bot.once('ready', () => {
  console.log(`Logged in as ${bot.user.tag}`);
  initGradio().catch(console.error);
});

bot.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const isDM = message.channel.type === 1;
  const content = message.content.trim();

  if (!content.startsWith(prefix)) {
    if (!isDM && !allowedChannels[message.channel.id]) return;

    // Regular chat message
    try {
      const result = await gradioClient.predict('/chat', {
        message: content,
        system_message: systemPrompt,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.9,
      });

      const response = result.data?.[0] || 'No response';
      message.reply(response);
    } catch (err) {
      console.error('Gradio error:', err);
      message.reply('Error talking to AI.');
    }

    return;
  }

  // Commands
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
