const { Player, useMainPlayer } = require('discord-player');
const queueUtil = require("../utils/queueFunctions.js");
const player = useMainPlayer();

player.events.on('playerStart', async (queue, track) => {
	if (queue?.metadata?.queueInfo) {
		queue.metadata.queueInfo.isLyricsMode = false;
	}
	queueUtil.sendQueue(queue);
});

player.events.on('audioTrackAdd', async (queue, track) => {
	queueUtil.updateQueue(queue);
});
player.events.on('audioTracksAdd', async (queue, track) => {
	queueUtil.updateQueue(queue);
});

player.events.on('disconnect', async (queue) => {
	queueUtil.deleteQueue(queue);
});
player.events.on('emptyChannel', async (queue) => {
	queueUtil.deleteQueue(queue);
});
player.events.on('error', async (queue, error) => {
	console.error("Player encountered an error");
	console.error(error);
});