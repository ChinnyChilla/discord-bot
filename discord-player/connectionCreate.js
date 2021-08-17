module.exports = async (client, queue, connection) => {
    console.log(`Connection established in server ${queue.metadata.guild.id}`)
    message.channel.send('\u200B').then(async function (message) {
        const path = require('path');
        const fs = require('fs');

        const reqPath = path.join(__dirname, '../data/likedSongs.json')

        

        client.queueMessages.set(message.guild.id, message)
        await message.react('❤️')
        const filter = (reaction, user) => {return reaction.emoji.name === '❤️'}
        const collector = message.createReactionCollector(filter)
        client.queueReactionsCollections.set(message.guild.id, collector)
        collector.on('collect', (reaction, user) => {
            const likedSongs = require(reqPath)
            const song = client.player.nowPlaying(message)
            const url = song.url
            var userLikedSongs = likedSongs[user.id]
            if (!userLikedSongs) {
                userLikedSongs = new Array();
            }
            const index = userLikedSongs.indexOf(url);
            if (index > -1) {
                userLikedSongs.splice(index, 1);
                sendMessage.execute(message, `<@${user.id}>, Removed ${song.title} from your liked playlist!`)
            } else {
                userLikedSongs.push(url)
                sendMessage.execute(message, `<@${user.id}>, Added ${song.title} to your liked playlist!`)
            }
            likedSongs[user.id] = userLikedSongs
            // going to save Track objects instead of just urls in the future
            fs.writeFile(reqPath, JSON.stringify(likedSongs), function(err) {
                if (err) {
                    console.error(`An Error has occured! ${err}`)
                }
            })
            message.reactions.resolve('❤️').users.remove(user.id)
        })
    })
}