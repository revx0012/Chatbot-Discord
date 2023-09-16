const { Client, IntentsBitField, MessageMentions } = require('discord.js');
const { GradioChatBot } = require('gradio-chatbot');
const fs = require('fs');
const channelsFile = 'channels.json';

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

let serverSettings = loadServerSettings();
let botInstance = null;

function loadServerSettings() {
    try {
        const data = fs.readFileSync(channelsFile, 'utf8');
        return JSON.parse(data) || {};
    } catch (error) {
        console.error('Error loading server settings:', error);
        return {};
    }
}

function saveServerSettings() {
    fs.writeFileSync(channelsFile, JSON.stringify(serverSettings, null, 4), 'utf8');
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

async function createBot(rules) {
    if (!botInstance) {
        botInstance = new GradioChatBot({
            url: 'https://huggingface.co/spaces/mosaicml/mpt-30b-chat'
        });
        console.log("Setting system prompt..");
        await botInstance.chat(`Hello! You are a chatbot named "Chatbot". ${rules}`);
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

    const rules = `Your rules here`; // Your rules here
    const serverId = message.guild.id;
    const splitMessage = message.content.toLowerCase().split(' ');

    if (splitMessage[0] === PREFIX.toLowerCase()) {
        const command = splitMessage[1];

        if (command === 'chatbot') {
            // The user wants to set up the chatbot for this channel
            if (splitMessage[2] && splitMessage[2].startsWith('<#') && splitMessage[2].endsWith('>')) {
                const channelId = splitMessage[2].slice(2, -1);

                if (!channelId) {
                    message.channel.sendTyping();
                    message.channel.send('Please specify a valid channel.');
                    return;
                }

                serverSettings[serverId] = {
                    channelId: channelId,
                };

                saveServerSettings();
                message.channel.send(`Chatbot has been set up for this channel: <#${channelId}>`);
            } else {
                message.channel.send('Please specify a valid channel to set up the chatbot.');
            }
        }
    } else if (serverSettings[serverId] && serverSettings[serverId].channelId === message.channel.id) {
        // The bot will only respond in the specified channel for the current server
        const bot = await createBot(rules);
        message.channel.sendTyping();
        const response = await bot.send(message.content);
        message.channel.send(`[BOT]: ${response}`);
    }
});

client.login(TOKEN);
