const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios')
const https = require('https');
const { useMainPlayer } = require('discord-player');
const { EmbedBuilder } = require('discord.js')
const logger = require('./logger');
const { lyricsExtractor } = require('@discord-player/extractor')

async function sendQueue(queue) {
	const authorFinder = lyricsExtractor();
	queueInfo = queue.metadata.queueInfo;
	queueInfo.setQueue(queue);
	const guildID = queueInfo.guildID;
	logger.guildLog(queueInfo.guildID, "debug", "Started sendQueue function")

	const instance = axios.create({
		httpsAgent: new https.Agent({
			rejectUnauthorized: false
		})
	});
	const date = new Date()
	setTimeout(() => {
		queue = queueInfo.queue
		if (!queueInfo.queue.currentTrack) {
			logger.guildLog(queueInfo.guildID, "warn", "Could not find currentTrack, deleting queue");
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
		}).catch(err => {
			logger.guildLog(queueInfo.guildID, "error", [err, "Failed to send POST request to server"]);
		})
	}, 1000)

	const queueMessage = queueInfo.message
	const tracks = queue.tracks.toArray();

	var authorInfo;

	try {
		const authorResults = await authorFinder.search(queue.currentTrack.cleanTitle + " by " + queue.currentTrack.author);

		if (authorResults) {
			authorInfo = {
				name: authorResults.artist.name,
				iconURL: authorResults.artist.image,
				url: authorResults.artist.url,
			}
			if (!validateAuthorName(queue.currentTrack.author, authorInfo)) {
				authorInfo = {
					name: queue.currentTrack.author,
				}
			}
		} else {
			authorInfo = {
				name: queue.currentTrack.author,
			}
		}
	} catch (err) {
		logger.guildLog(queueInfo.guildID, "warn", "Failed to get author information")
		authorInfo = {
			name: queue.currentTrack.author,
		}
	}

	const discordEmbed = new EmbedBuilder()
		.setTitle(queue.currentTrack.title)
		.setURL(queue.currentTrack.url)
		//('0' + time).slice(-2) used to add another 0 if <10
		.setAuthor(authorInfo)
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
		logger.guildLog(queueInfo.guildID, "debug", "No interval found, attempting to create one");
		// Call it the first time so it doesn't have to wait
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
				discordEmbed.setDescription(progressionBar)
			} catch (err) {
				logger.guildLog(queue.guild.id, "error", [err, "Failed to create progression bar"]);
			}
			discordEmbed.setDescription(progressionBar)
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
					.setURL(`${process.env.SERVER_BASE_URL}/music-queues/${guildID}`),
				new ButtonBuilder()
					.setCustomId("lyrics")
					.setLabel("Lyrics Mode")
					.setStyle(ButtonStyle.Secondary),
			])
		

		try { 
			queueMessage.edit({ embeds: [discordEmbed], components: [row] }).catch((err) => {
				logger.guildLog(queueInfo.guildID, "error", [err, "Failed to update queueMessage"])
			})
		}
		catch (err) {
			logger.guildLog(queueInfo.guildID, "error", [err, "Failed to edit queueMessage"])
		}

		if (!queueInfo.buttonCollector) {
			logger.guildLog(queueInfo.guildID, "debug", "No buttonCollector found, attempting to create one")
			const filter = i => !i.bot
			const collector = queueMessage.channel.createMessageComponentCollector({ filter });
			collector.on('collect', async c => {
				logger.guildLog(queueInfo.guildID, "debug", "Colelcted a button press");
				logger.guildLog(queueInfo.guildID, "trace", c)
				if (c.customId == "resume") {
					if (!queue.node.isPaused()) {
						c.reply('Already playing').catch((err) => logger.guildLog(queueInfo.guildID, "error", [err, "Error in c.reply"]))
					} else {
						queue.node.setPaused(false)
						c.deferReply().catch((err) => logger.guildLog(queueInfo.guildID, "error", [err, "Cannot defer reply"]));
						c.deleteReply().catch((err) => logger.guildLog(queueInfo.guildID, "error", [err, "cannot delete reply"]));
						updateQueue(queue);
					}

				}
				if (c.customId == "pause") {
					if (queue.node.isPaused()) {
						c.reply('Already paused').catch((err) => logger.guildLog(queueInfo.guildID, "error", [err, "Error in c.reply"]))
					} else {
						queue.node.setPaused(true)
						c.deferReply().catch((err) => logger.guildLog(queueInfo.guildID, "error", [err, "Cannot defer reply"]));
						c.deleteReply().catch((err) => logger.guildLog(queueInfo.guildID, "error", [err, "cannot delete reply"]));
						updateQueue(queue);
					}
				}
				if (c.customId == "skip") {
					queue.node.skip();
					c.reply("Skipped!").catch((err) => logger.guildLog(queueInfo.guildID, "error", [err, "Error in c.reply"]));
					updateQueue(queue);
				}
				if (c.customId == "lyrics") {
					if (queueInfo.isLyricsMode) {
						c.reply("You are already in lyrics mode!")
						return;
					}
					const switchResult = await switchToLyricsMode(queue);
					if (switchResult[0]) {
						c.reply("Successfully switched to lyrics mode!");
					} else {
						c.reply(switchResult[1]);
					}
				}

				setTimeout(() => {
					c.deleteReply().catch(err => {
						if (err.httpStatus == 404) {
							logger.guildLog(queueInfo.guildID, "warn", "Reply already deleted")
						} else {
							logger.guildLog(queueInfo.guildID, "error", [err, "Error in deleting reply"])
						}
					})
				}, 5000)
			})
			logger.guildLog(queueInfo.guildID, "debug", "Successfully created ButtonCollector")
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
					discordEmbed.setDescription(progressionBar)
				} catch (err) {
					logger.guildLog(queue.guild.id, "error", [err, "Failed to create progression bar"]);
				}
				
			}

			queueMessage.edit({ embeds: [discordEmbed] }).catch((err) => {
				logger.guildLog(queue.guild.id, "error", [err, "Failed to send edit queueMessage (in interval)"])
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
	}).catch(err => logger.guildLog(guildID, "error", [err, "Error sending queue"]))
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
	var progressionBar = ""
	if (queue.currentTrack) {
		try {
			progressionBar = queue.node.createProgressBar({
				timecodes: true,
				length: 15,
				indicator: "🟢",
				line: "─"
			})
			discordEmbed.setDescription(progressionBar)
		} catch (err) {
			logger.guildLog(queue.guild.id, "error", [err, "Failed to create progression bar"]);
		}
	}
	const queueMessage = queueInfo.message
	queueMessage.edit({ embeds: [discordEmbed] }).catch((err) => {
		logger.guildLog(guildID, "error", [err, "Failed to send edit queueMessage! (in updateQueue):"])
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
	}).catch(err => logger.guildLog(guildID, "error", [err, "Error updating queue with delete: "]))

	queueInfo.deleteQueueMessage()

	if (queueInfo.interval) {
		queueInfo.clearQueueInterval()
	}
	if (queueInfo.buttonCollector) {
		queueInfo.stopButtonCollector()
	}
	queueInfo.isLyricsMode = false;
}

function formatMilliseconds(ms) {
	if (!ms) {
		return "00:00";
	}
	// Calculate total seconds
	let totalSeconds = Math.floor(ms / 1000);

	// Calculate minutes and remaining seconds
	let minutes = Math.floor(totalSeconds / 60);
	let seconds = totalSeconds % 60;

	// Format minutes and seconds as two-digit strings
	let formattedMinutes = minutes.toString().padStart(2, '0');
	let formattedSeconds = seconds.toString().padStart(2, '0');

	// Combine minutes and seconds in MM:SS format
	return `${formattedMinutes}:${formattedSeconds}`;
}
async function switchToLyricsMode(queue) {
	const player = useMainPlayer();
	const queueInfo = queue.metadata.queueInfo;
	if (!queue.currentTrack) {
		logger.guildLog(queueInfo.guildID, "warn", "No current track found");
		return [false, "Error in getting current song"];
	}
	var results;
	try {
		results = await player.lyrics.search({ q: queue.currentTrack.cleanTitle + " " + queue.currentTrack.author })
	} catch (e) {
		return [false, "Error in getting current song"]
	}
	
	const lyrics = results[0];

	if (!lyrics?.syncedLyrics) {
		return [false, "Current song does not support synced lyrics"];
	}

	if (queueInfo.interval) {
		queueInfo.clearQueueInterval()
	}


	const authorFinder = lyricsExtractor();
	var result;
	var syncedLyrics;
	try {
		result = await authorFinder.search(queue.currentTrack.cleanTitle + " " + queue.currentTrack.author)
		syncedLyrics = queue.syncedLyrics(lyrics);
	} catch (e) {
		return [false, "Error in retrieving lyrics for this song"]
	}
	
	syncedLyrics.onChange(async (lyrics, timestamp) => {
		const discordEmbed = new EmbedBuilder()
			.setTitle(queue.currentTrack.title)
			.setURL(queue.currentTrack.url)
			//('0' + time).slice(-2) used to add another 0 if <10
			.setThumbnail(queue.currentTrack.thumbnail);
		
			if (result) {
				discordEmbed.setAuthor({
					name: result.artist.name,
					iconURL: result.artist.image,
					url: result.artist.url,
				})
			}
			
		if (queue.currentTrack) {
			var progressionBar = ""
			try {
				progressionBar = queue.node.createProgressBar({
					timecodes: true,
					length: 15,
					indicator: "🟢",
					line: "─"
				})
				discordEmbed.setDescription(progressionBar)
			} catch (err) {
				logger.guildLog(queue.guild.id, "error", [err, "Failed to create progression bar"]);
			}
			
			discordEmbed.setDescription(progressionBar)
		}
		const previousLine = getPreviousLine(timestamp, syncedLyrics.lyrics);
		const nextLine = getNextLine(timestamp, syncedLyrics.lyrics);
		discordEmbed.addFields(
			{name: '\u200B', value: `[${previousLine?.timestamp}] ${previousLine?.line}`},
			{name: `[${formatMilliseconds(timestamp)}] ${lyrics}`, value: `[${nextLine?.timestamp}] ${nextLine?.line}`},
		);
		const queueMessage = queueInfo.message
		queueMessage.edit({ embeds: [discordEmbed] }).catch((err) => {
			logger.guildLog(queueInfo.guildID, "error", [err, "Failed to send edit queueMessage! (in lyricsMode):"])
			return
		})
	})
	if (queueInfo?.isLyricsMode == false) {
		queueInfo.isLyricsMode = true;
		syncedLyrics.subscribe();
	}
	return [true];
}

function getPreviousLine(currentTimestamp, lyricsMap) {
	let previousTimestamp = -1;
	let previousLine = "";

	for (let [timestamp, line] of lyricsMap) {
		if (timestamp >= currentTimestamp) {
			break;
		}
		previousTimestamp = timestamp;
		previousLine = line;
	}

	return previousTimestamp !== -1 ? { timestamp: formatMilliseconds(previousTimestamp), line: previousLine } : null;
}

// Function to get the next line with its timestamp
function getNextLine(currentTimestamp, lyricsMap) {
	for (let [timestamp, line] of lyricsMap) {
		if (timestamp > currentTimestamp) {
			return { timestamp: formatMilliseconds(timestamp), line: line };
		}
	}

	return null;
}

function validateAuthorName(author, artistInfo) {
	const authorLower = author.toLowerCase()
	const artistLower = artistInfo.name.toLowerCase();

	return (
		authorLower.includes(artistLower) ||
		artistLower.includes(authorLower) ||
		artistLower.includes(authorLower.split(', ')[0])
	)
}

module.exports = {
	sendQueue,
	updateQueue,
	deleteQueue
}