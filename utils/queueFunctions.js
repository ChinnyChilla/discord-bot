const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios')
const https = require('https')

async function sendQueue(queue) {
	queueInfo = queue.metadata.queueInfo;
	queueInfo.setQueue(queue);
	const guildID = queueInfo.guildID;
	const instance = axios.create({
		httpsAgent: new https.Agent({
			rejectUnauthorized: false
		})
	});
	const date = new Date()
	setTimeout(() => {
		queue = queueInfo.queue
		if (!queueInfo.queue.currentTrack) {
			deleteQueue(queue)
			return
		}
		const queueToSend = {
			tracks: queue.tracks.toArray(),
			previousTracks: queue.history.tracks.toArray(),
			playing: queue.playing,
			channelName: queue.channel?.name,
			paused: queue.node.isPaused(),
			guildName: queue.guild.name,
			firstTrack: queue.currentTrack,
			currentStreamTime: queue.estimatedPlaybackTime,
			timeSongFinish: new Date(date.getTime() + queue.currentTrack.durationMS - queue.node.estimatedPlaybackTime).getTime()
		}
		instance.post(`${process.env.SERVER_BASE_URL}/api/post/updateQueue`, {
			action: 'send_queue',
			token: process.env.SERVER_QUEUE_TOKEN,
			id: guildID,
			queue: queueToSend
		}).catch(err => console.log("Error sending queue: " + err))
	}, 1000)
	const queueMessage = queueInfo.message

	const tracks = queue.tracks.toArray();

	const { EmbedBuilder } = require('discord.js')
	const discordEmbed = new EmbedBuilder()
		.setTitle(`Now Playing: ${queue.currentTrack.title}`)
		.setURL(queue.currentTrack.url)
		//('0' + time).slice(-2) used to add another 0 if <10
		.setTimestamp()
		.setThumbnail(queue.currentTrack.thumbnail)
		.addFields({ name: '\u200B', value: `Requested By ${queue.currentTrack.requestedBy.tag}` })

	if (tracks) {
		const { ms, s, m, h, d } = require('time-convert')
		const time = ms.to(h, m, s)(queue.estimatedDuration)
		const footer = `Queue Length ${('0' + time[0]).slice(-2)}:${('0' + time[1]).slice(-2)}:${('0' + time[2]).slice(-2)}`
		discordEmbed.setFooter({ text: footer.toString() })
	} else { discordEmbed.setFooter({ text: "No more songs!" }) }
	for (let i = 0; i < 5; i++) {
		if (!tracks[i]) { break }
		var track = tracks[i]
		discordEmbed.addFields(
			{ name: `${i + 1}: ${track.title}`, value: `Requested by ${track.requestedBy.tag}`, inline: true },
			{ name: track.duration, value: `[${track.source}](${track.url})`, inline: true },
			{ name: 'Author', value: track.author, inline: true },
		)

	}
	if (queue.paused) {
		discordEmbed.setColor(0xFF0000)

	} else {
		discordEmbed.setColor(0x00FF00)
	}
	const repeatModes = ['TRACK', 'QUEUE', 'AUTOPLAY']
	if (queue.repeatMode) {
		discordEmbed.addFields({ name: "Repeat mode:", value: repeatModes[queue.repeatMode - 1] })
	}
	queueInfo.setEmbed(discordEmbed)
	const isInterval = queueInfo.interval
	if (!isInterval) {
		// Call it the first time so it doesn't have to wait
		var progressionBar = ""
		const discordEmbed = queueInfo.embed
		if (queue.currentTrack) {
			progressionBar = queue.node.createProgressBar({
				timecodes: true,
				length: 15,
				indicator: "🟢",
				line: "─"
			})
			discordEmbed.setDescription(`Author: ${queue.currentTrack.author} \n ${progressionBar}`)
		}
		const row = new ActionRowBuilder()
			.setComponents([
				new ButtonBuilder()
					.setCustomId("pause")
					.setLabel("Pause")
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId("resume")
					.setLabel("Resume")
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('skip')
					.setLabel('Skip')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setLabel("Web Version")
					.setStyle(ButtonStyle.Link)
					.setURL(`${process.env.SERVER_BASE_URL}/music-queues/${guildID}`)
			])
		

		try { queueMessage.edit({ embeds: [discordEmbed], components: [row] }).catch("Something went wrong when editing") }
		catch {
			console.log("something wrong happened")
		}

		if (!queueInfo.buttonCollector) {
			const filter = i => !i.bot
			const collector = queueMessage.channel.createMessageComponentCollector({ filter });
			collector.on('collect', async c => {
				if (c.customId == "resume") {
					if (!queue.node.isPaused()) {
						c.reply('Already playing')
					} else {
						queue.node.setPaused(false)
						c.deferReply();
						c.deleteReply();
						updateQueue(queue);
					}

				}
				if (c.customId == "pause") {
					if (queue.node.isPaused()) {
						c.reply('Already paused')
					} else {
						queue.node.setPaused(true)
						c.deferReply();
						c.deleteReply();
						updateQueue(queue);
					}
				}
				if (c.customId == "skip") {
					queue.node.skip();
					c.reply("Skipped!")
					updateQueue(queue);
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
			if (queue.currentTrack) {
				try {
					progressionBar = queue.node.createProgressBar({
						timecodes: true,
						length: 15,
						indicator: "🟢",
						line: "─"
					})
					discordEmbed.setDescription(`Author: ${queue.currentTrack.author} \n ${progressionBar}`)
				} catch (err) {
					console.log("failed to create progression bar" + err);
				}
				
			}

			queueMessage.edit({ embeds: [discordEmbed] }).catch((err) => {
				console.log("Failed to send edit queueMessage!:" + err)
			})

		}, 1000 * 10);
		queueInfo.setInterval(interval)
	}
}

async function updateQueue(queue) {
	queueInfo = queue.metadata.queueInfo;
	queueInfo.setQueue(queue);
	const guildID = queueInfo.guildID;
	if (!queueInfo) { return }
	const discordEmbed = queueInfo.embed
	if (!discordEmbed) { return }
	if (!queueInfo.queue.currentTrack) {
		deleteQueue(queue)
		return
	}
	const tracks = queueInfo.queue.tracks.toArray();
	if (!tracks) { return }
	discordEmbed.spliceFields(0, 20)
	const instance = axios.create({
		httpsAgent: new https.Agent({
			rejectUnauthorized: false
		})
	});
	const date = new Date();
	const queueToSend = {
		tracks: queue.tracks.toArray(),
		previousTracks: queue.history.tracks,
		playing: queue.playing,
		channelName: queue.channel?.name,
		paused: queue.node.isPaused(),
		guildName: queue.guild.name,
		firstTrack: queue.currentTrack,
		currentStreamTime: queue.estimatedPlaybackTime,
		timeSongFinish: new Date(date.getTime() + queue.currentTrack.durationMS - queue.node.estimatedPlaybackTime).getTime()

	}
	instance.post(`${process.env.SERVER_BASE_URL}/api/post/updateQueue`, {
		action: 'send_queue',
		token: process.env.SERVER_QUEUE_TOKEN,
		id: guildID,
		queue: queueToSend
	}).catch(err => console.log("Error sending queue: " + err))
	for (let i = 0; i < 5; i++) {
		if (!tracks[i]) { break }
		var track = tracks[i]

		discordEmbed.addFields(
			{ name: `${i + 1}: ${track.title}`, value: `Requested by ${track.requestedBy.tag}`, inline: true },
			{ name: track.duration, value: `[${track.source}](${track.url})`, inline: true },
			{ name: 'Author', value: track.author, inline: true },
		)

	}
	if (tracks) {
		const { ms, s, m, h, d } = require('time-convert')
		const time = ms.to(h, m, s)(queue.estimatedDuration)
		const footer = `Queue Length ${('0' + time[0]).slice(-2)}:${('0' + time[1]).slice(-2)}:${('0' + time[2]).slice(-2)}`
		discordEmbed.setFooter({ text: footer.toString() })
	} else { discordEmbed.setFooter("No more songs!") }

	if (queue.node.isPaused()) {
		discordEmbed.setColor(0xFF0000)

	} else {
		discordEmbed.setColor(0x00FF00)
	}
	if (queue.repeatMode) {
		const repeatModes = ['TRACK', 'QUEUE', 'AUTOPLAY']
		discordEmbed.addFields({ name: "Repeat mode:", value: repeatModes[queue.repeatMode - 1] })
	}
	queueInfo.setEmbed(discordEmbed)
	if (queue.currentTrack) {
		var progressionBar = queue.node.createProgressBar({
			timecodes: true,
			length: 15,
			indicator: "🟢",
			line: "─"
		})
		discordEmbed.setDescription(`${progressionBar}`)
	}
	const queueMessage = queueInfo.message
	console.log("editing queue message");
	queueMessage.edit({ embeds: [discordEmbed] }).catch((err) => {
		console.log("Failed to send edit queueMessage!:" + err)
		return
	})
}

async function deleteQueue(queue) {
	const queueInfo = queue.metadata.queueInfo
	const guildID = queueInfo.guildID
	const instance = axios.create({
		httpsAgent: new https.Agent({
			rejectUnauthorized: false
		})
	});
	instance.post(`${process.env.SERVER_BASE_URL}/api/post/updateQueue`, {
		action: 'delete',
		token: process.env.SERVER_QUEUE_TOKEN,
		id: guildID,
		queue: { 'deleted': true }
	}).catch(err => console.log("Error updating delete: " + err))

	if (!queueInfo) { return }
	queueInfo.deleteQueueMessage()

	if (queueInfo.interval) {
		queueInfo.clearQueueInterval()
	}
	if (queueInfo.buttonCollector) {
		queueInfo.stopButtonCollector()
	}
}

module.exports = {
	sendQueue,
	updateQueue,
	deleteQueue
}