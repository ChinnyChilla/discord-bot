module.exports = {
    name: 'skip',
    category: 'music',
    description: 'Skips song(s)',
    args: '[Amount of times]',
    execute(client, message, args) {
        const sendMessage = client.functions.get('sendMessageTemp')
        if (!args[0]) {
            client.player.skip(message)
            sendMessage.execute(message, "Skipping!")
        }
        else if (args[0].match(/^[0-9]+$/)) {
             client.player.jump(message, parseInt(args[0]))
             sendMessage.execute(message, `Skipping ${args[0]} times!`)
        } else {
            client.player.skip(message)
            sendMessage.execute(message, "Skipping!")
        }
    }
}