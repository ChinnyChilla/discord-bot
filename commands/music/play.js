const {ApplicationCommandOptionType, EmbedBuilder} = require('discord.js')
const { QueryType, useMainPlayer } = require('discord-player')

const {sendMessage} = require('../../functions/sendMessage')
const musicUtils = require('../../utils/musicFunctions.js')
const logger = require('../../utils/logger.js');
module.exports = {
    name: 'play',
    description: 'Plays a song',
    category: 'music',
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "song",
            description: "Song URL/Title or Playlist URL",
            required: true,
        },
		{
			type: ApplicationCommandOptionType.String,
			name: "source",
			description: "Search engine to use",
			choices: [
				{
					name: "YouTube",
					value: QueryType.YOUTUBE_SEARCH,
				},
				{
					name: "SoundCloud",
					value: QueryType.SOUNDCLOUD_SEARCH,
				},
				{
					name: "Spotify",
					value: QueryType.SPOTIFY_SEARCH,
				},
				{
					name: "Apple Music",
					value: QueryType.APPLE_MUSIC_SEARCH,
				}
			]
		}
    ],
    
    async execute(client, interaction) {
		
        if (!interaction.member.voice.channel) {
            return sendMessage(client, interaction, "Please join a voice channel", {ephemeral: true})
        }
        const requestedSong = interaction.options.getString('song')
		const searchEngine = interaction.options.getString('source', false) ?? QueryType.SPOTIFY_SEARCH;  
		const player = useMainPlayer();

		const queue = player.nodes.get(interaction.guild.id);
            
        if (queue && (interaction.channel.id != queue.metadata.channel.id)) {
            return sendMessage(client, interaction, `For this server, the music commands only work in <#${queue.metadata.channel.id}>`, {ephemeral: true})
        }
        
        const song = await player.search(requestedSong, {
            requestedBy: interaction.member,
			searchEngine: searchEngine
        })
		logger.guildLog(interaction.guild.id, "debug", `Searched ${requestedSong}`)
		logger.guildLog(interaction.guild.id, "trace", song.tracks);
        if (!song.tracks[0]) {
            return sendMessage(client, interaction, "Could not find song!", {ephermal: true})
        }
        var index = 0
        if (!requestedSong.match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/)) {
            if (client.usersInMessageReactions.includes(interaction.member.id)) {
                return sendMessage(client, interaction, "Please wait until your previous interaction is over", {ephemeral: true})
            }
			const numberOfSongs = Math.min(5, song.tracks.length);
            const embed = new EmbedBuilder()
            .setTitle("Please select a video")
            .setDescription(`Type in a number 1-${numberOfSongs} to select your video`);
            for(i=0;i<numberOfSongs;i++) {
                var track = song.tracks[i]
                embed.addFields(
                {name: `${i + 1}: ${track.title}`, value: `Author: ${track.author}`, inline: true},
                {name: track.duration, value: `[${track.source}](${track.url})`, inline: true},
                {name: '\u200B', value: "\u200B", inline: true},
            )}
			embed.addFields({name: `Type anything else to quit`, value:"\u200b", inline:false})
            sendMessage(client, interaction, "", {embeds: [embed], ephemeral: true})
            const filter = (message) => message.author.id == interaction.member.id
            const collector = interaction.channel.createMessageCollector({filter, max:1, time:15000})
            client.usersInMessageReactions.push(interaction.member.id)
            collector.on('end', async collected => {
                const index = client.usersInMessageReactions.indexOf(interaction.member.id)
                if (index > -1) {
                    client.usersInMessageReactions.splice(index, 1)
                }
                if (collected.size == 0) {return sendMessage(client, interaction, "Timed out", {embeds: []})}
				collected.first().delete()
                if (collected.first().content.match(/([1-5])/)) {
					number = parseInt(collected.first().content)
					if (!(0 < number < 6)) {return interaction.editReply("Number too big or small")}
                    musicUtils.addTracks(interaction, [song.tracks[number - 1]])
                    sendMessage(client, interaction, `Selected video ${collected.first().content}`,{ embeds: []})
                    return
                }
                return sendMessage(client, interaction, `Message wasn't a number between 1-${numberOfSongs}`, {embeds: []})
            })
        } else {
            if (song.playlist) {
                sendMessage(client, interaction, `Playlist ${song.playlist.title} added!`, {ephemeral: true})
                await musicUtils.addTracks(interaction, song.playlist.tracks)
            } else {
                sendMessage(client, interaction, `Track ${song.tracks[index].title} added!`, {ephemeral: true});
                await musicUtils.addTracks(interaction, [song.tracks[index]])
            }
        }
    }
}
