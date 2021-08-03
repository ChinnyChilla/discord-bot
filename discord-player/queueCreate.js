module.exports = (client, message, queue) => {
    message.channel.send('\u200B').then(async function (message) {
        const path = require('path');
        const fs = require('fs');

        const reqPath = path.join(__dirname, '../data/likedSongs.json')

        const sendMessage = client.functions.get('sendMessageTemp')
        

        client.queueMessages.set(message.guild.id, message)
        console.log(`Set message to ${message.guild.id}`)
        await message.react('❤️')
        const filter = (reaction, user) => {return reaction.emoji.name === '❤️'}
        const collector = message.createReactionCollector(filter)
        client.queueReactionsCollections.set(message.guild.id, collector)
        collector.on('collect', (reaction, user) => {
            const likedSongs = require(reqPath)
            const song = client.player.nowPlaying(message)
            const url = song.url
            var userLikedSongs = likedSongs[message.author.id]
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
            likedSongs[message.author.id] = userLikedSongs
            fs.writeFile(reqPath, JSON.stringify(likedSongs), function(err) {
                if (err) {
                    console.error(`An Error has occured! ${err}`)
                }
            })
        })
    })
}