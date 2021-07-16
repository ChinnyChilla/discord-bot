module.exports = {
    name: 'resume',
    category: 'music',
    description: 'Resumes music',
    args: '',
    execute(client, message, args) {
        const sendMessage = client.functions.get('sendMessageTemp')
        if (client.player.isPlaying(message)) {
            sendMessage.execute(message, "It isn't paused!")
        } else {
            sendMessage.execute(message, "Resuming!")
            client.player.resume(message)
        }
    }
}