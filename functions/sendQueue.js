module.exports = {
    name: 'sendQueue',
    category: 'functions',
    description: 'Sends the queue',
    args: '[client, queue]',
    execute(client, queuetemp, firstTrack) {
        const guildID = queuetemp.metadata.guild.id
        const queue = client.player.getQueue(guildID)

        const queueMessage = client.queueMessages.get(guildID)
        if (queueMessage.deleted) {return client.functions.get('deleteQueue').execute(client, queue)}

        const tracks = queue.tracks

        const { MessageEmbed }  = require('discord.js')
        const discordEmbed = new MessageEmbed()
        .setTitle(`Now Playing: ${firstTrack.title}`)
        .setURL(firstTrack.url)
        //('0' + time).slice(-2) used to add another 0 if <10
        .setTimestamp()
        .setThumbnail(firstTrack.thumbnail)
        .addField('\u200B', `Requested By ${firstTrack.requestedBy.tag}`)


        if (tracks) {
            
            const {ms, s, m, h, d} = require('time-convert')
            const time = ms.to(h, m, s)(queue.totalTime)
            discordEmbed.setFooter(`Queue Length ${('0' + time[0]).slice(-2)}:${('0' + time[1]).slice(-2)}:${('0' + time[2]).slice(-2)}`,
                    'https://media.discordapp.net/attachments/810009113009979394/821078381419561000/Anime_Girl.gif')
        } else {discordEmbed.setFooter("No more songs!")}
        for(let i=0; i<5; i++) {
            if(!tracks[i]) {break}
            var track = tracks[i]
            discordEmbed.addFields(
                {name: `${i + 1}: ${track.title}`, value: `Requested by ${track.requestedBy.tag}`, inline: true},
                {name: track.duration, value: `[${track.source}](${track.url})`, inline: true},
                {name: 'Author', value: track.author, inline: true},
            )
            
        }
        if (queue.paused) {
            discordEmbed.setColor("RED")
            
        } else {
            discordEmbed.setColor("GREEN")
        }
        const repeatModes = ['TRACK', 'QUEUE', 'AUTOPLAY']
        if (queue.repeatMode) {
            discordEmbed.addField("Repeat mode:", repeatModes[queue.repeatMode - 1])
        }
        client.queueEmbeds.set(guildID, discordEmbed)
        const isInterval = client.queueIntervals.get(guildID)
        if (!isInterval) {
            const interval = setInterval(() => {
                var progressionBar = ""
                const discordEmbed = client.queueEmbeds.get(guildID)
                if (queue.tracks) {
                    progressionBar = queue.createProgressBar({
                        timecodes: true,
                        length: 15,
                        indicator: "🟢",
                        line: "─"
                    })
                }
                discordEmbed.setDescription(`Author: ${firstTrack.author} \n ${progressionBar}`)
                try {queueMessage.edit({embeds: [discordEmbed]}).catch("Something went wrong when editing")}
                catch {
                    queue.destory()
                    client.functions.get('deleteQueue').execute(client, queue)
                }
            }, 2000);
            client.queueIntervals.set(guildID, interval)
        }

        
    }
}