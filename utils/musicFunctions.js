const { useMainPlayer } = require('discord-player');
const { sendMessage } = require('../utils/discordFunctions.js')
const queueInfo = require("../functions/createQueueInfoClass.js")
const logger = require('./logger');

async function createQueue(interaction) {
	const player = useMainPlayer();

	const queueMessage = await interaction.channel.send(`Bound to <#${interaction.channel.id}>`)
	var newQueueInfo = new queueInfo(queueMessage)
	logger.guildLog(interaction.guild.id, "debug", `Created a queue messge in channel ${interaction.channel.name}`);

	player.nodes.create(interaction.guild.id, {
		ytdlOptions: {
			filter: 'audioonly',
			quality: 'highest',
			highWaterMark: 1 << 25,
			dlChunkSize: 0,
		},
		metadata: {
			channel: interaction.channel,
			queueInfo: newQueueInfo,
			guildID: interaction.guild.id,
		}
	});
	logger.guildLog(interaction.guild.id, "debug", "Created a player node")
}


async function getQueue(interaction) {
	const player = useMainPlayer();
	var existsQueue = player.nodes.get(interaction.guild.id);

	if (!existsQueue) {
		logger.guildLog(interaction.guild.id, "debug", "No queue found, creating one")
		await createQueue(interaction);
	}
	return player.nodes.get(interaction.guild.id);
}

async function addTracks(interaction, tracks) {
	
	var queue = await getQueue(interaction);
	queue.addTrack(tracks);

	await play(interaction);
}

async function play(interaction) {
	var queue = await getQueue(interaction);
	try {
		if (!queue.connection) { 
			logger.guildLog(interaction.guild.id, "info", "Attempting to join channel");
			await queue.connect(interaction.member.voice.channel);
		}
	} catch (err) {
		sendMessage(client, interaction, "Failed to join your voice channel!", { ephemeral: true })
		logger.guildLog(interaction.guild.id, "error", [err, "Issue joining channel"]);
	}
	
	if (!queue.isPlaying()) {
		await queue.node.play(queue.tracks[0]);
	}
}

module.exports = { createQueue, getQueue, play, addTracks }