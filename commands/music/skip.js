module.exports = {
    name: 'skip',
    category: 'music',
    description: 'Skips song(s)',
    args: '[Amount of times]',
    execute(client, interaction) {
        const sendMessage = client.functions.get('sendMessageTemp')
        if (!args[0]) {
            client.player.skip(message)
            sendMessage.execute(message, "Skipping!")
        }
        else if (args[0].match(/^[0-9]+$/)) {
            if (client.player.getQueue(message).tracks.length > parseInt(args[0])) {
                client.player.jump(message, parseInt(args[0]))
                sendMessage.execute(message, `Skipping ${args[0]} times!`)
            } else {
                client.commands.get('quit').execute(client, interaction)
            }
        } else {
            client.player.skip(message)
            sendMessage.execute(message, "Skipping!")
        }
    }
}