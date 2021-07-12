module.exports = {
    name: 'skip',
    category: 'music',
    description: 'Skip song',
    args: '[Amount of times]',
    execute(client, message, args) {
        if (!args[0]) {
            client.player.skip(message)
        }
        else if (args[0].match(/^[0-9]+$/)) {
             client.player.jump(message, parseInt(args[0]))
        } else {
            client.player.skip(message)
        }
    }
}