const TOKEN = process.env['TOKEN'];

module.exports = {
    name: 'restart',
    description: 'Restart the bot.',
    permissions: ['BAN_MEMBERS'],

    execute(message, client) {
        message.reply('Restarting...');
        client.destroy(); // Destroy the client (close connection)
        client.login(TOKEN); // Log in again
    },
};
