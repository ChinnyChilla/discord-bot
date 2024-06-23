const { Player, useMainPlayer } = require('discord-player');
const queueUtil = require("../utils/queueFunctions.js");
const logger = require('../utils/logger.js');
const player = useMainPlayer();

player.events.on('playerStart', async (queue, track) => {
	logger.guildLog(queue.guild.id, "debug", "playerStart event")
	if (queue?.metadata?.queueInfo) {
		queue.metadata.queueInfo.isLyricsMode = false;
	}
	queueUtil.sendQueue(queue);
});

player.events.on('audioTrackAdd', async (queue, track) => {
	logger.guildLog(queue.guild.id, "debug", "audioTrackAdd event")
	logger.guildLog(queue.guild.id, "debug", track)
	queueUtil.updateQueue(queue);
});
player.events.on('audioTracksAdd', async (queue, track) => {
	logger.guildLog(queue.guild.id, "debug", "audioTracksAdd event")
	logger.guildLog(queue.guild.id, "debug", track)
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
	
	if (error.type == "AbortError") {
		logger.guildLog(queue.guild.id, "error", [error, "AbortErorr; quitting"]);
		queue.node.stop();
		queueUtil.deleteQueue(queue);
	}
	logger.guildLog(queue.guild.id, "error", [error, "Player encountered an error"])
});