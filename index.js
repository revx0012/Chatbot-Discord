const { Client, IntentsBitField, MessageMentions } = require('discord.js');
const { GradioChatBot } = require('gradio-chatbot');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
});

const TOKEN = process.env['TOKEN'];
const PREFIX = '<@1141993367169941504>';
const allowedChannels = new Map(); // Store allowed channels by guild ID

let activeChats = new Map();
let botInstance = null;

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

async function createBot(rules) {
    if (!botInstance) {
        botInstance = new GradioChatBot({
            url: 'https://huggingface.co/spaces/mosaicml/mpt-30b-chat'
        });
        console.log("Setting system prompt..");
        await botInstance.chat(`Hello! You are a chatbot named "ChatGPT Jailbroken". ${rules}`);
    }

    return {
        send: async (prompt) => {
            const response = await botInstance.chat(prompt);
            return response;
        }
    };
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Check if the message starts with the bot prefix and "chatbot" command
    if (message.content.toLowerCase().startsWith(PREFIX.toLowerCase())) {
        const command = message.content.toLowerCase().split(' ')[1];
        if (command === 'chatbot') {
            // The user wants to set up the chatbot for this channel
            const channelId = message.mentions.channels.first().id;

            if (!channelId) {
                message.channel.send('Please specify a valid channel.');
                return;
            }

            // Save the channel ID where the bot should respond
            activeChats.set(channelId, message.author.id);
            message.channel.send(`Chatbot has been set up for this channel: <#${channelId}>`);
        } else {
            message.channel.send('Invalid command. Use `<@1141993367169941504> chatbot #channel` to set up the chatbot for a specific channel.');
        }
    } else if (activeChats.has(message.channel.id)) {
        // The bot will only respond in the specified channel
        const bot = activeChats.get(message.channel.id);
        const response = await bot.send(message.content);
        message.channel.send(`[BOT]: ${response}`);
    }
});

client.login(TOKEN);
