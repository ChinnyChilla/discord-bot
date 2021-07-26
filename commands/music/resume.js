module.exports = {
    name: 'resume',
    category: 'music',
    description: 'Resumes music',
    args: '',
    execute(client, message, args) {
        const sendMessage = client.functions.get('sendMessageTemp')
        if (client.player.getQueue(message).paused) {
            sendMessage.execute(message, "Resuming!")
            client.player.resume(message)
        } else {
            sendMessage.execute(message, "It isn't paused!")
        }
        client.functions.get('sendQueue').execute(client, message)
    }
}