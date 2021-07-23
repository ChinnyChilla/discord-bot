module.exports = {
    name: 'sendQueue',
    category: 'functions',
    description: 'Sends the queue as a message (used for updating as well)',
    args: '[client, message]',
    execute(client, message) {
        const EmbedID = client.queueMessages.get(message.guild.id)
        if (!EmbedID) {
            var wait = setInterval(() => {
                const EmbedID = client.queueMessages.get(message.guild.id)
                if(EmbedID) {
                    clearInterval(wait)
                    goOn()
                }
            }, 1000)
        } else {goOn()}
        function goOn() {
            const EmbedID = client.queueMessages.get(message.guild.id)
            var progressionBar = client.player.createProgressBar(message, {
                timecodes: true,
                length: 20,
                indicator: "•",
                line: "-"
            })
            queue = client.player.getQueue(message)
            const {ms, s, m, h, d} = require('time-convert')
            const time = ms.to(h, m, s)(queue.totalTime)

            const tracks = queue.tracks
            const Discord = require('discord.js')
            const discordEmbed = new Discord.MessageEmbed()
            .setTitle(`Now Playing: ${tracks[0].title}`)
            .setURL(tracks[0].url)
            .setImage('https://media.tenor.com/images/5eb0693c2e72e93563ed6bbec35be6a4/tenor.gif')
            //('0' + time).slice(-2) used to add another 0 if <10
            .setFooter(`Queue Length ${('0' + time[0]).slice(-2)}:${('0' + time[1]).slice(-2)}:${('0' + time[2]).slice(-2)}`,
                        'https://media.discordapp.net/attachments/810009113009979394/821078381419561000/Anime_Girl.gif')
            .setTimestamp()
            .setThumbnail(tracks[0].thumbnail)
            .addField('\u200B', `Requested By ${tracks[0].requestedBy.tag}`)

            for(let i=1; i<6; i++) {
                if(!tracks[i]) {break}
                var track = tracks[i]
                discordEmbed.addFields(
                    {name: `${i}: ${track.title}`, value: `Requested by ${track.requestedBy.tag}`, inline: true},
                    {name: track.duration, value: `[${track.source}](${track.url})`, inline: true},
                    {name: 'Author', value: track.author, inline: true},
                )
                
            }
            if (client.player.isPlaying(message)) {
                discordEmbed.setColor("GREEN")
            } else {
                discordEmbed.setColor("RED")
            }
            if (queue.loopMode) {
                discordEmbed.addField('\u200B', "Repeating Queue!")
            }
            client.queueEmbeds.set(message.guild.id, discordEmbed)
            const isInterval = client.queueIntervals.get(message.guild.id)
            if (!isInterval) {
                const interval = setInterval(() => {
                    var repeat = ''
                    const discordEmbed = client.queueEmbeds.get(message.guild.id)
                    var progressionBar = client.player.createProgressBar(message, {
                        timecodes: true,
                        length: 15,
                        indicator: "🟢",
                        line: "─"
                    })
                    if (queue.repeatMode) {
                        repeat = 'Repeating song! \n'
                    }
                    discordEmbed.setDescription(`Author: ${tracks[0].author} \n` + repeat + progressionBar)
                    EmbedID.edit(discordEmbed).catch("Something went wrong when editing")
                }, 3000);
                client.queueIntervals.set(message.guild.id, interval)
            }

        }
        
    }
}