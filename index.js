const { Client, IntentsBitField, MessageMentions } = require('discord.js');
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

function saveServerSettings() {
    fs.writeFileSync(channelsFile, JSON.stringify(serverSettings, null, 4), 'utf8');
}

function loadRules() {
    try {
        const data = fs.readFileSync(rulesFile, 'utf8');
        return data.split('\n').filter((rule) => rule.trim() !== '');
    } catch (error) {
        console.error('Error loading rules:', error);
        return [];
    }
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

    const serverId = message.guild.id;
    const splitMessage = message.content.toLowerCase().split(' ');

    if (splitMessage[0] === PREFIX.toLowerCase()) {
        const command = splitMessage[1];

        if (command === 'chatbot') {
            // Check if the user has BAN_MEMBERS permission
            if (!message.member.permissions.has('BAN_MEMBERS')) {
                message.channel.send('You do not have permission to use this command.');
                return;
            }

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
            // Check if the user has BAN_MEMBERS permission
            if (!message.member.permissions.has('BAN_MEMBERS')) {
                message.channel.send('You do not have permission to use this command.');
                return;
            }

            message.channel.send('Restarting...').then(() => {
                process.exit(0); // Replace this with your bot's restart logic
            });
        } else if (command === 'ruleadd') {
            // Check if the user has BAN_MEMBERS permission
            if (!message.member.permissions.has('BAN_MEMBERS')) {
                message.channel.send('You do not have permission to use this command.');
                return;
            }

            const newRule = message.content.substring(PREFIX.length + command.length + 1);

            if (newRule.trim() !== '') {
                rules.push(newRule);

                saveRules();

                message.channel.send(`Rule added: "${newRule}"\nUse the command \`restart\` to restart manually.`);
            } else {
                message.channel.send('Please provide a valid rule to add.');
            }
        }
    }

    if (serverSettings[serverId] && serverSettings[serverId].channelId === message.channel.id) {
        const bot = await createBot(rules);
        message.channel.sendTyping();
        const response = await bot.send(message.content);
        message.channel.send(`[BOT]: ${response}`);
    }
});

client.login(TOKEN);
