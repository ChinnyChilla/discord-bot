module.exports = {
    name: 'reload',
    category: 'core',
    description: 'Reload all the commands of the discord bot (REQUIRES DEV)',
    args: '',
    execute(client, message, args) {
        client.functions.get('sendMessageTemp').execute(message, "**WIP**")
    }
}