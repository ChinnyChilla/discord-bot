module.exports = {
    name: 'ping',
    description: 'Pings the discord bot',
    category: 'test',
    execute(client, interaction) {
        var now = Date.now();
        interaction.editReply(`Pong! ${now - interaction.createdAt} ms`).then(function(message) {
        })
    }
}