module.exports = async (client, queue, connection) => {
    client.functions.get('log').execute(queue.guild.id, "Connection established")

    const path = require('path');
    const fs = require('fs');

    const reqPath = path.join(__dirname, '../data/likedSongs.json')

    
    const message = client.queueMessages.get(queue.metadata.guild.id)
    
    await message.react('❤️')
    const filter = (reaction, user) => reaction.emoji.name === '❤️'
    const collector = message.createReactionCollector({filter})
    client.queueReactionsCollections.set(message.guild.id, collector)
    collector.on('collect', (reaction, user) => {
        const likedSongs = require(reqPath)
        const song = queue.nowPlaying(message)
        const url = song.url
        var userLikedSongs = likedSongs[user.id]
        if (!userLikedSongs) {
            userLikedSongs = new Array();
        }
        const index = userLikedSongs.indexOf(url);
        if (index > -1) {
            userLikedSongs.splice(index, 1);
            message.channel.send(`<@${user.id}>, Removed ${song.title} from your liked playlist!`).then(message => {
                setTimeout(() => message.delete(), 10000)
            })
        } else {
            userLikedSongs.push(url)
            message.channel.send(`<@${user.id}>, Added ${song.title} to your liked playlist!`).then(message => {
                setTimeout(() => message.delete(), 10000)
            })
        }
        
        likedSongs[user.id] = userLikedSongs
        fs.writeFile(reqPath, JSON.stringify(likedSongs), function(err) {
            if (err) {
                console.error(`An Error has occured! ${err}`)
            }
        })
        message.reactions.resolve('❤️').users.remove(user.id)
    })
}