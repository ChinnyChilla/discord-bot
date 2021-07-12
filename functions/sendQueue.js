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
            const tracks = queue.tracks
            const Discord = require('discord.js')
            const discordEmbed = new Discord.MessageEmbed()
            .setTitle(`Now Playing: ${tracks[0].title}`)
            .setURL(tracks[0].url)
            .setImage('https://media.tenor.com/images/5eb0693c2e72e93563ed6bbec35be6a4/tenor.gif')
            .setFooter(`Queue Length ${queue.totalTime}`, 'https://media.discordapp.net/attachments/810009113009979394/821078381419561000/Anime_Girl.gif')
            .setTimestamp()
            .setColor("GREEN")
            .setThumbnail(tracks[0].thumbnail)

            for(let i=1; i<5; i++) {
                if(!tracks[i]) {break}
                var track = tracks[i]
                discordEmbed.addFields(
                    {name: `${i}: ${track.title}`, value: `Requested by ${track.requestedBy.tag}`, inline: true},
                    {name: track.duration, value: `[Link](${track.url})`, inline: true},
                    {name: '\u200B', value: '\u200B'},
                )
                
            }
            client.queueEmbeds.set(message.guild.id, discordEmbed)
            const isInterval = client.queueIntervals.get(message.guild.id)
            if (!isInterval) {
                const interval = setInterval(() => {
                    const discordEmbed = client.queueEmbeds.get(message.guild.id)
                    var progressionBar = client.player.createProgressBar(message, {
                        timecodes: true,
                        length: 15,
                        indicator: "🟢",
                        line: "⬜"
                    })
                    discordEmbed.setDescription(progressionBar)
                    EmbedID.edit(discordEmbed).catch("Something went wrong when editing")
                }, 3000);
                client.queueIntervals.set(message.guild.id, interval)
            }

        }
        
    }
}