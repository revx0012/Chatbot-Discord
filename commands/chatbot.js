const fs = require('fs');
const PREFIX = '<@1141993367169941504>';

module.exports = {
    name: 'chatbot',
    description: 'Set up the chatbot channel for this server.',
    usage: `${PREFIX} chatbot #channel`,
    permissions: 'BAN_MEMBERS', // Replace with the actual permission you want

    execute(message, args) {
        if (args.length !== 1 || !args[0].startsWith('<#') || !args[0].endsWith('>')) {
            message.reply(`Usage: ${PREFIX} chatbot #channel`);
            return;
        }

        const channelId = args[0].slice(2, -1);
        const serverId = message.guild.id;
        const serverSettings = loadServerSettings();

        serverSettings[serverId] = {
            channelId: channelId,
        };

        saveServerSettings(serverSettings);
        message.reply(`Chatbot has been set up for this channel: <#${channelId}>`);
    },
};

function loadServerSettings() {
    try {
        const data = fs.readFileSync('channels.json', 'utf8');
        return JSON.parse(data) || {};
    } catch (error) {
        console.error('Error loading server settings:', error);
        return {};
    }
}

function saveServerSettings(serverSettings) {
    fs.writeFileSync('channels.json', JSON.stringify(serverSettings, null, 4), 'utf8');
}
