module.exports = {
    name: 'ping',
    category: 'test',
    description: 'Pings the discord bot',
    args: '',
    execute(client, interaction) {
        var now = Date.now();
        message.channel.send(`Pong! (v2) ${now - message.createdAt} ms`).then(function(message) {
            message.delete({timeout: 15000})
        })
    }
}