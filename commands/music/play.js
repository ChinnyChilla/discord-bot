module.exports = {
    name: 'play',
    category: 'music',
    description: 'Plays the song',
    args: '[link/title/playlist]',
    async execute(client, message, args) {
        const sendMessage = client.functions.get("sendMessageTemp")
        if (!message.member.voice.channel) {
            return sendMessage.execute(message, "Please join a voice channel")
        }
        if (!args[0]) {
            return sendMessage.execute(message, "Please send a link or title of song")
        }
        if  (args[0] == ".liked") {
            const fs = require('fs');
            const path = require('path');
            const reqPath = path.join(__dirname, '../../data/likedSongs.json')
            const data = require(reqPath)
            if (!data[message.author.id] || data[message.author.id].length == 0) {return sendMessage.execute(message, "Please first like some songs!")}

            const songs = data[message.author.id]

            
            var promises = new Array();
            songs.forEach(async song => {
                promises.push(new Promise((resolve, reject) => {
                    client.player.play(message, song, {firstResult: true}).then(() => {resolve('Success')}).catch(err => {reject(err)})
                }))
                
            })
            async function checkPromises() {
                await Promise.all(promises)
                sendMessage.execute(message, `<@${message.author.id}>, Playing all your liked songs!>`)
            }
            checkPromises();
            return
            
        }
        const queue = client.player.createQueue(message.guild, {metadata: message});
        const song = await client.player.search(args.join(" "), {
            requestedBy: message.author
        })
        try {
            await queue.connect(message.member.voice.channel)
        } catch {
            sendMessage.execute(message, "Failed to join your voice channel!")
        }

        queue.addTrack(song.tracks[0])
        queue.play();

    }
}