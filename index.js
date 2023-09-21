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

// Initialize an empty object to hold loaded commands
const serverSettings = loadServerSettings();
const commands = new Map();

// Function to load commands from the "commands" folder
function loadCommands() {
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        commands.set(command.name, command);
    }
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    loadCommands(); // Load commands when the bot is ready
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const serverId = message.guild.id;
    const splitMessage = message.content.toLowerCase().split(' ');

    if (splitMessage[0] === PREFIX.toLowerCase()) {
        const commandName = splitMessage[1];
        const command = commands.get(commandName);

        if (!command) return; // If the command is not found, do nothing

        // Check if the user has the required permissions to execute the command
        if (command.permissions && !message.member.permissions.has(command.permissions)) {
            message.channel.send('You do not have permission to use this command.');
            return;
        }

        try {
            command.execute(message);
        } catch (error) {
            console.error(error);
            message.channel.send('An error occurred while executing the command.');
        }
    }
});

client.login(TOKEN);
