const {MessageActionRow, MessageButton} = require('discord.js');
const axios = require('axios')
const https = require('https')
module.exports = {
    name: 'sendQueue',
    category: 'functions',
    description: 'Sends the queue after every song',
    args: '[client, queue]',
    async execute(client, queuetemp, firstTrack) {
		const guildID = queuetemp.metadata.guild.id

		const queueInfo = client.queueInfo.get(guildID)
        const queue = client.player.getQueue(guildID)
		const instance = axios.create({
			httpsAgent: new https.Agent({  
				rejectUnauthorized: false
			})
		});
		const date = new Date()
		setTimeout(() => {
			const queueToSend = {
				tracks: queue.tracks,
				previousTracks: queue.previousTracks,
				playing: queue.playing,
				channelName: queue.connection.channel.name,
				paused: queue.connection.paused,
				guildName: queue.guild.name,
				firstTrack: firstTrack,
				currentStreamTime: queue.streamTime,
				timeSongFinish: new Date(date.getTime() + firstTrack.durationMS - queue.streamTime)
			}
			instance.post('https://localhost:443/api/post/updateQueue', {
				action: 'send_queue',
				token: 'example',
				id: guildID,
				queue: queueToSend
			})
		}, 1000)
        const queueMessage = queueInfo.message

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
			const footer = `Queue Length ${('0' + time[0]).slice(-2)}:${('0' + time[1]).slice(-2)}:${('0' + time[2]).slice(-2)}`
            discordEmbed.setFooter({text: footer.toString()})
        } else {discordEmbed.setFooter({text: "No more songs!"})}
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
        queueInfo.setEmbed(discordEmbed)
        const isInterval = queueInfo.interval
        if (!isInterval) {
            // Call it the first time so it doesn't have to wait
            var progressionBar = ""
            const discordEmbed = queueInfo.embed
            if (queue.tracks) {
                progressionBar = queue.createProgressBar({
                    timecodes: true,
                    length: 15,
                    indicator: "🟢",
                    line: "─"
                })
            }
			const row = new MessageActionRow()
			.setComponents([
				new MessageButton()
					.setCustomId("pause")
					.setLabel("Pause")
					.setStyle('PRIMARY'),
				new MessageButton()
					.setCustomId("resume")
					.setLabel("Resume")
					.setStyle('PRIMARY'),
				new MessageButton()
					.setCustomId('skip')
					.setLabel('Skip')
					.setStyle('PRIMARY')
			])
            discordEmbed.setDescription(`Author: ${firstTrack.author} \n ${progressionBar}`)
            
            try {queueMessage.edit({embeds: [discordEmbed], components: [row]}).catch("Something went wrong when editing")}
            catch {
                queue.stop()
            }
			
			if (!queueInfo.buttonCollector) {
				const filter = i => !i.bot
				const collector = queueMessage.channel.createMessageComponentCollector({filter});
				collector.on('collect', async c => {
					if (c.customId == "resume") {
						queue.setPaused(false)
						c.reply("Resumed!")
						client.functions.get('updateQueue').execute(client, queue)

					}
					if (c.customId == "pause") {
						queue.setPaused(true)
						c.reply("Paused!")
						client.functions.get('updateQueue').execute(client, queue, true)
					}
					if (c.customId == "skip") {
						if (queue.tracks.length == 0) {
							queue.stop()
							client.functions.get('log').execute(guildID, `No more songs, leaving!`)
							return c.reply('No more songs, leaving!!')
						}
						queue.skip()
						c.reply("Skipped!")
						client.functions.get('updateQueue').execute(client, queue)
					}

					setTimeout(() => {
						c.deleteReply().catch(err => {
							if (err.httpStatus == 404) {
								console.log("Reply already deleted")
							}
						})
					}, 5000)
				})
				queueInfo.setButtonCollector(collector)
			}
            const interval = setInterval(() => {
                var progressionBar = ""
                const discordEmbed = queueInfo.embed
                if (queue.tracks) {
                    progressionBar = queue.createProgressBar({
                        timecodes: true,
                        length: 15,
                        indicator: "🟢",
                        line: "─"
                    })
                }
                discordEmbed.setDescription(`Author: ${firstTrack.author} \n ${progressionBar}`)
                
                queueMessage.edit({embeds: [discordEmbed]}).catch((err) => {
                    queueMessage.channel.send("Failed to edit message, leaving!")
					console.log("Failed to send edit queueMessage!:" + err)
                    return queue.stop()
                })

            }, 1000 * 20);
            queueInfo.setInterval(interval)
        }
    }
}