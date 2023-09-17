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

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const rules = fs.readFileSync(rulesFile, 'utf8'); // Read rules from rules.txt

    const serverId = message.guild.id;

    const splitMessage = message.content.toLowerCase().split(' ');

    if (splitMessage[0] === PREFIX.toLowerCase()) {
        const command = splitMessage[1];

        if (command === 'chatbot' && !message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
            message.channel.send('You do not have permission to use this command.');
            return;
        }

        // The user wants to set up the chatbot for this channel
        if (command === 'chatbot') {
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
        } else if (command === 'restart' && !message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
            message.channel.send('You do not have permission to use this command.');
        } else if (command === 'restart' && message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
            message.channel.send('Restarting...');
            process.exit();
        } else if (command === 'ruleadd' && !message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
            message.channel.send('You do not have permission to use this command.');
        } else if (command === 'ruleadd' && message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
            const newRule = message.content.slice(command.length + PREFIX.length + 1); // Extract the rule text

            // Check if the ruleToAdd is not empty
            if (newRule) {
                // Append the new rule to rules.txt
                fs.appendFileSync(rulesFile, `\n${newRule}`, 'utf8');
                message.channel.send('Rule added. Use the command `restart` to restart manually.');
            } else {
                message.channel.send('Please specify a rule to add.');
            }
        }
    } else if (serverSettings[serverId] && message.channel.id === serverSettings[serverId].channelId) {
        // The bot will only respond in the specified channel
        const bot = await createBot(rules);
        message.channel.sendTyping();
        const response = await bot.send(message.content);
        message.channel.send(`[BOT]: ${response}`);
    }
});

client.login(TOKEN);