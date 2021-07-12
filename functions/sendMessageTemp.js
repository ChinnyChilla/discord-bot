module.exports = {
    name: 'sendMessageTemp',
    category: 'functions',
    description: 'Sends a message and removes it after a period of time',
    args: '[DiscordMessage, Message]',
    execute(messageObj, message) {
        messageObj.channel.send(message).then(function(message) {
            message.delete({timeout: 15000})
        })
    }
}