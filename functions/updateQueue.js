module.exports = {
    name: 'updateQueue',
    category: 'functions',
    description: 'Updates the queue',
    args: '[client, queue]',
    execute(client, queue, paused = false) {
        const guildID = queue.guild.id
        const discordEmbed = client.queueEmbeds.get(queue.metadata.guild.id)
        if (!discordEmbed) {return}
        const tracks = queue.tracks
        if (!tracks) {return}
        discordEmbed.spliceFields(0, 20)
        for(let i=0; i<5; i++) {
            if(!tracks[i]) {break}
            var track = tracks[i]
            
            discordEmbed.addFields(
                {name: `${i + 1}: ${track.title}`, value: `Requested by ${track.requestedBy.tag}`, inline: true},
                {name: track.duration, value: `[${track.source}](${track.url})`, inline: true},
                {name: 'Author', value: track.author, inline: true},
            )
            
        }
        if (tracks) {
            const {ms, s, m, h, d} = require('time-convert')
            const time = ms.to(h, m, s)(queue.totalTime)
            discordEmbed.setFooter(`Queue Length ${('0' + time[0]).slice(-2)}:${('0' + time[1]).slice(-2)}:${('0' + time[2]).slice(-2)}`,
                    'https://media.discordapp.net/attachments/810009113009979394/821078381419561000/Anime_Girl.gif')
        } else {discordEmbed.setFooter("No more songs!")}
        
        if (paused) {
            discordEmbed.setColor("RED")
        
        } else {
            discordEmbed.setColor("GREEN")
        }
        if (queue.repeatMode == 2) {
            discordEmbed.addField('\u200B', "Repeating Queue!")
        }
        client.queueEmbeds.set(guildID, discordEmbed)
    }
}