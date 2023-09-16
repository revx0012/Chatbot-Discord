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
        return data.split('\n');
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

async function createBot(rulesText) {
    if (!botInstance) {
        botInstance = new GradioChatBot({
            url: 'https://huggingface.co/spaces/mosaicml/mpt-30b-chat'
        });
        console.log("Setting system prompt..");
        await botInstance.chat(`Hello! You are a chatbot named "Chatbot". ${rulesText}`);
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

    const serverId = message.guild.id;
    const splitMessage = message.content.toLowerCase().split(' ');

    // Check if the message starts with one of the allowed commands
    const allowedCommands = ['restart', 'chatbot', 'ruleadd']; // Add other allowed commands here
    if (allowedCommands.includes(splitMessage[0])) {
        // Check if the user has BAN_MEMBERS permission for commands
        if (!message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
            message.channel.send('You do not have permission to use this command.');
            return;
        }
    }

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
        } else if (command === 'restart') {
            botInstance = null;
            message.channel.send('Bot has been restarted.');
        } else if (command === 'ruleadd') {
            if (splitMessage.length > 2) {
                const newRule = message.content.substring(message.content.indexOf('"') + 1, message.content.lastIndexOf('"'));
                rules.push(`@ChatGPT ${newRule}`);
                saveRules();
                message.channel.send(`Rule added: "${newRule}"\nUse the command \`restart\` to apply changes.`);
            } else {
                message.channel.send('Please provide a valid rule to add.');
            }
        }
    }

    if (serverSettings[serverId] && serverSettings[serverId].channelId === message.channel.id) {
        const bot = await createBot(rules.join('\n'));
        message.channel.sendTyping();
        const response = await bot.send(message.content);
        message.channel.send(`[BOT]: ${response}`);
    }
});

client.login(TOKEN);
