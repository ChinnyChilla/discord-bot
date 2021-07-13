module.exports = {
    name: 'play',
    category: 'music',
    description: 'Plays the song',
    args: '[link/title/playlist]',
    execute(client, message, args) {
        const func = client.functions.get("sendMessageTemp")
        if (!message.member.voice.channel) {
            return func.execute(message, "Please join a voice channel")
        }
        if (!args[0]) {
            return func.execute(message, "Please send a link or title of song")
        }
        client.player.play(message, args.join(" "), {firstResult: true})
    }
}