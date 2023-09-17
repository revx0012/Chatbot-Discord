const fs = require('fs');
const channelsFile = 'channels.json';

module.exports = {
    name: 'chatbot',
    description: 'Set up or configure the chatbot channel.',
    permissions: ['BAN_MEMBERS'],

    execute(message) {
        const args = message.content.slice(1).trim().split(/ +/);
        if (args.length !== 2 || !args[1].startsWith('<#') || !args[1].endsWith('>')) {
            message.reply('Usage: `@ChatGPT chatbot #channel`');
        } else {
            const channelId = args[1].slice(2, -1);
            const serverId = message.guild.id;

            // Load existing channel settings from channels.json
            let serverSettings = loadServerSettings();

            // Add or update the channel setting for the server
            serverSettings[serverId] = {
                channelId: channelId,
            };

            // Save the updated settings back to channels.json
            saveServerSettings(serverSettings);

            message.reply(`Chatbot has been set up for this channel: <#${channelId}>`);
        }
    },
};

function loadServerSettings() {
    try {
        const data = fs.readFileSync(channelsFile, 'utf8');
        return JSON.parse(data) || {};
    } catch (error) {
        console.error('Error loading server settings:', error);
        return {};
    }
}

function saveServerSettings(serverSettings) {
    fs.writeFileSync(channelsFile, JSON.stringify(serverSettings, null, 4), 'utf8');
}
