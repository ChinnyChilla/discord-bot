module.exports = {
    name: 'pause',
    category: 'music',
    description: 'Pauses music',
    args: '',
    execute(client, message, args) {
        const sendMessage = client.functions.get('sendMessageTemp')
        if (client.player.getQueue(message).paused) {
            sendMessage.execute(message, "It is already paused!")
        } else {
            sendMessage.execute(message, "Pausing!")
            client.player.pause(message)
        }
        client.functions.get('sendQueue').execute(client, message)
    }
}