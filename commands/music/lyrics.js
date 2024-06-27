const { sendMessage } = require('../../functions/sendMessage')
const { useMainPlayer } = require('discord-player');
const { lyricsExtractor } = require('@discord-player/extractor');
const { EmbedBuilder } = require('discord.js')
const discordFuncs = require('../../utils/discordFunctions.js')
module.exports = {
	name: 'lyrics',
	description: 'Get lyrics for current song',
	category: 'music',
	args: '',
	async execute(client, interaction) {
		discordFuncs.deferReply(interaction);
		const player = useMainPlayer();
		const queue = player.nodes.get(interaction.guild.id);
		if (!queue) { return sendMessage(client, interaction, "There is currently no queue!", {emphemeral: true}) }
		if (interaction.channel.id != queue.metadata.channel.id) {
			return sendMessage(client, interaction, `For this server, the music commands only work in <#${queue.metadata.channel.id}>`, {emphemeral: true})
		}

		if (!queue.currentTrack) {
			return sendMessage(client, interaction, "Something happened, try again", {emphemeral: true});
		}
		const lyricsFinder = lyricsExtractor();

		const result = await lyricsFinder.search(queue.currentTrack.cleanTitle + " " + queue.currentTrack.author)
		console.log("after search")
		if (!result || !result.lyrics) {
			sendMessage(client, interaction, "No results for this song title!", {emphemeral: true});
			return;
		} 
		const numberOfMessages = Math.ceil(result.lyrics.length / 4000);

		var embedArray = [];
		const embed = new EmbedBuilder()
			.setTitle(result.title)
			.setURL(result.url)
			.setThumbnail(result.thumbnail)
			.setAuthor({
				name: result.artist.name,
				iconURL: result.artist.image,
				url: result.artist.url,
			})
			.setDescription(result.lyrics.slice(0, 4000));
		embedArray.push(embedArray)

		for (var i=1; i<numberOfMessages; i++) {
			const string = result.lyrics.slice(i * 4000, (i+1) * 4000 )
			embedArray.push(new EmbedBuilder().setDescription(string));
		}
		
		sendMessage(client, interaction, "Here is your lyrics", { embeds: embedArray, ephemeral: true });
		return;
	}
}