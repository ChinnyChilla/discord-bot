module.exports = {
    name: 'pause',
    category: 'music',
    description: 'Pauses music',
    args: '',
    execute(client, message, args) {
        const sendMessage = client.functions.get('sendMessageTemp')
        if (client.player.isPlaying(message)) {
            sendMessage.execute(message, "Pausing!")
            client.player.pause(message)
        } else {
            sendMessage.execute(message, "It is already paused!")
        }
    }
}