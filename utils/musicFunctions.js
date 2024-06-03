const { Player } = require('discord-player');
const { sendMessage } = require('../utils/discordFunctions.js')
const queueInfo = require("../functions/createQueueInfoClass.js")

async function createQueue(interaction) {
	const player = Player.singleton();

	const queueMessage = await interaction.channel.send(`Bound to <#${interaction.channel.id}>`)
	var newQueueInfo = new queueInfo(queueMessage)

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
}


async function getQueue(interaction) {
	const player = Player.singleton();
	var existsQueue = player.nodes.get(interaction.guild.id);

	if (!existsQueue) {
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
		if (!queue.connection) { await queue.connect(interaction.member.voice.channel) }
	} catch {
		sendMessage(client, interaction, "Failed to join your voice channel!", { ephemeral: true })
	}
	
	if (!queue.isPlaying()) {
		await queue.node.play(queue.tracks[0]);
	}
}

module.exports = { createQueue, getQueue, play, addTracks }