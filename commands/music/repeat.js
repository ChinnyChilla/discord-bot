module.exports = {
    name: 'repeat',
    category: 'music',
    description: 'Repeats music/entire queue',
    args: "[, stop, queue, queue stop]",
    execute(client, message, args) {
        const sendMessage = client.functions.get('sendMessageTemp')
        if (!args[0]) {
            client.player.setRepeatMode(message, true)
            sendMessage.execute(message, "Repeating current song!")
        } else if (args[0].toLowerCase() == 'stop') {
            client.player.setRepeatMode(message, false)
            sendMessage.execute(message, "Stopped repeating current song!")
        } else if (args[0].toLowerCase() == 'queue') {
            if (!args[1]) {
                client.player.setLoopMode(message, true)
                sendMessage.execute(message, "Repeating current queue!")
            } else if (args[1].toLowerCase() == 'stop') {
                client.player.setLoopMode(message, false)
                sendMessage.execute(message, "Stopped repeating current queue!")
            }
        }
        client.functions.get('sendQueue').execute(client, message)
    }
}