const { Client, IntentsBitField, Permissions } = require('discord.js');
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

const serverSettings = loadServerSettings();

function loadServerSettings() {
    try {
        const data = fs.readFileSync('channels.json', 'utf8');
        return JSON.parse(data) || {};
    } catch (error) {
        console.error('Error loading server settings:', error);
        return {};
    }
}

client.commands = new Map();

// Load commands from the 'commands' folder
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    loadCommands(); 

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
        const commandName = splitMessage[1];
        const args = splitMessage.slice(2);

        if (client.commands.has(commandName)) {
            const command = client.commands.get(commandName);

	    if (!command) return;

            // Check if the user has the required permissions to execute the command
            if (command.permissions && !message.member.permissions.has(command.permissions)) {
                message.reply('You do not have permission to use this command.');
                return;
            }

            // Execute the command
            try {
                command.execute(message, args);
            } catch (error) {
                console.error(error);
                message.reply('An error occurred while executing the command.');
            }
        }
    } else if (serverSettings[serverId] && message.channel.id === serverSettings[serverId].channelId) {
        // The bot will respond only in the specified channel
        const bot = await createBot(serverSettings[serverId].rules);
        message.channel.sendTyping();
        const response = await bot.send(message.content);
        message.reply(`[BOT]: ${response}`);
    }
});

client.login(TOKEN);
