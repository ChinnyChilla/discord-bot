const { useMainPlayer } = require('discord-player');
const queueUtil = require("../utils/queueFunctions.js");
const logger = require('../utils/logger.js');
const player = useMainPlayer();

player.events.on('playerStart', async (queue, track) => {
	logger.guildLog(queue.guild.id, "debug", `playerStart event | Track: ${track.title}`)
	logger.guildLog(queue.guild.id, "trace", track);
	if (queue?.metadata?.queueInfo) {
		queue.metadata.queueInfo.isLyricsMode = false;
	}
	queueUtil.sendQueue(queue);
});

player.events.on('audioTrackAdd', async (queue, track) => {
	logger.guildLog(queue.guild.id, "debug", `audioTrackAdd event | Track: ${track.title}`)
	logger.guildLog(queue.guild.id, "trace", track);
	queueUtil.updateQueue(queue);
});
player.events.on('audioTracksAdd', async (queue, track) => {
	logger.guildLog(queue.guild.id, "debug", `audioTracksAdd event | Number of tracks: ${track.length}`)
	logger.guildLog(queue.guild.id, "trace", track);
	queueUtil.updateQueue(queue);
});

player.events.on('disconnect', async (queue) => {
	logger.guildLog(queue.guild.id, "debug", "disconnect event")
	queueUtil.deleteQueue(queue);
});
player.events.on('emptyChannel', async (queue) => {
	logger.guildLog(queue.guild.id, "debug", "emptyChannel event")
	queueUtil.deleteQueue(queue);
});
player.events.on('error', async (queue, error) => {
	logger.guildLog(queue.guild.id, "error", [error, "Player encountered an error"])
	logger.guildLog(queue.guild.id, "info", "Resetting player and queue");
	queue.delete();
	await queueUtil.deleteQueue(queue);
});
player.events.on('playerError', async (error, track) => {
	logger.systemLog("error", [error, "Player encountered an playerError"])
	logger.systemLog("info", "Track has an error, skipping");
	if (track.queue) {
		track.queue.node.skip();
	}
})