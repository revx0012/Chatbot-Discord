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


function saveServerSettings() {
    fs.writeFileSync(channelsFile, JSON.stringify(serverSettings, null, 4), 'utf8');
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const rules = fs.readFileSync(rulesFile, 'utf8'); // Read rules from rules.txt

    const serverId = message.guild.id;
    const channelId = message.channel.id;

    // Check if the message is in the specified channel
    if (serverSettings[serverId] && channelId === serverSettings[serverId].channelId) {
        const bot = await createBot(rules);
        message.channel.sendTyping();
        const response = await bot.send(message.content);
        message.reply(`[BOT]: ${response}`);
        return; // Exit here to prevent command processing
    }

    const splitMessage = message.content.toLowerCase().split(' ');
    const command = splitMessage[0];

    if (command === `chatbot` && !message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
        message.reply('You do not have permission to use this command.');
        return;
    }

    if (command === 'restart' && message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
        message.reply('Restarting...');
        process.exit();
        client.login(TOKEN);
        return;
    }

    if (command === `addrule` && message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
        const newRule = message.content.slice(`${PREFIX}addrule`.length).trim();
        if (newRule) {
            fs.appendFileSync(rulesFile, `\n${newRule}`, 'utf8');
            message.reply('Rule added.');
        } else {
            message.reply('Please specify a rule to add.');
        }
        return;
    }
});


client.login(TOKEN);