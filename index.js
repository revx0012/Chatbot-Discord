const { Client, IntentsBitField, Permissions } = require('discord.js');
const { GradioChatBot } = require('gradio-chatbot');
const fs = require('fs');
const channelsFile = 'channels.json';
const rulesFile = 'rules.txt';

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
let rules = loadRules();

function loadServerSettings() {
    try {
        const data = fs.readFileSync(channelsFile, 'utf8');
        return JSON.parse(data) || {};
    } catch (error) {
        console.error('Error loading server settings:', error);
        return {};
    }
}

function loadRules() {
    try {
        const data = fs.readFileSync(rulesFile, 'utf8');
        return data.split('\n').filter(rule => rule.trim() !== '');
    } catch (error) {
        console.error('Error loading rules:', error);
        return [];
    }
}

function saveServerSettings() {
    fs.writeFileSync(channelsFile, JSON.stringify(serverSettings, null, 4), 'utf8');
}

function saveRules() {
    fs.writeFileSync(rulesFile, rules.join('\n'), 'utf8');
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

async function createBot(rules) {
    if (!botInstance) {
        botInstance = new GradioChatBot({
            url: 'https://huggingface.co/spaces/mosaicml/mpt-30b-chat',
        });
        console.log("Setting system prompt..");
        await botInstance.chat(`Hello! You are a chatbot named "Chatbot". ${rules}`);
    }

    return {
        send: async (prompt) => {
            const response = await botInstance.chat(prompt);
            return response;
        },
    };
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const serverId = message.guild.id;
    const splitMessage = message.content.toLowerCase().split(' ');

    if (activeChats.has(message.channel.id) || message.channel.id === serverSettings[serverId]?.channelId) {
        // The bot will respond without prefix in the specified channel
        const bot = await createBot(rules);
        message.channel.sendTyping();
        const response = await bot.send(message.content);
        message.channel.send(`[BOT]: ${response}`);
    } else if (message.content.startsWith(PREFIX)) {
        // The bot will respond with prefix in other channels
        const command = splitMessage[1];

        // Check if the user has BAN_MEMBERS permission for commands
        if (command === 'restart' || command === 'ruleadd' || command === 'chatbot') {
            if (!message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
                message.channel.send('You do not have permission to use this command.');
                return;
            }
        }

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
        } else if (command === 'restart') {
            message.channel.send('Restarting');
            client.destroy();
            client.login(TOKEN);
        } else if (command === 'ruleadd') {
            // Check if the user has BAN_MEMBERS permission for ruleadd
            if (!message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
                message.channel.send('You do not have permission to use this command.');
                return;
            }

            const newRule = message.content.split('"')[1];
            if (!newRule) {
                message.channel.send('Invalid rule format. Use `@ChatGPT ruleadd "your rule here"`');
                return;
            }

            rules.push(newRule);
            saveRules();
            message.channel.send('Rule added. Use the command `restart` to apply the changes.');
        }
    }
});

client.login(TOKEN);
