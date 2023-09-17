module.exports = {
    name: 'addrule',
    description: 'Add a rule to the bot.',
    permissions: ['BAN_MEMBERS'],

    execute(message, args) {
        const newRule = args.join(' ');

        if (newRule) {
            // Append the new rule to rules.txt
            fs.appendFileSync('rules.txt', `\n${newRule}`, 'utf8');
            message.reply(`Rule added: "${newRule}"`);
        } else {
            message.reply('Please specify a rule to add.');
        }
    },
};
