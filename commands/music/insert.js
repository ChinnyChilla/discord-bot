const { QueryType } = require('discord-player')
const {ApplicationCommandOptionType, EmbedBuilder} = require('discord.js')
module.exports = {
    name: 'insert',
    description: 'Insert the song',
    category: 'music',
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "song",
            description: "Song URL/Title or Playlist URL",
            required: true,
        },
        {
            type: ApplicationCommandOptionType.Integer,
            name: 'position',
            description: "Where to put it (0 is instantly playing)",
            required: true
        }
    ],
    async execute(client, interaction) {
		const sendAsEphermal = true;
        const queue = client.player.getQueue(interaction.guild)
        if (!queue) {return interaction.reply({content: "There is currently no queue!", ephermal: sendAsEphermal})}
        if (interaction.channel.id != queue.metadata.channel.id) {
            return interaction.reply({content: `For this server, the music commands only work in <#${queue.metadata.channel.id}>`, ephermal: true})
        }
        const requestedSong = interaction.options.getString('song')
        const position = interaction.options.getInteger('position')
        if (position < 0) {return interaction.editReply("Invalid position")}

        const song = await client.player.search(requestedSong, {
            requestedBy: interaction.member,
			searchEngine: QueryType.AUTO
        })
        if (!song.tracks[0]) {return interaction.reply({content: "Could not find song!", ephermal: sendAsEphermal})}
        async function insertTrack(track) {
            if (position == 0) {
                await queue.insert(track, 0)
                const currentSong = queue.nowPlaying()
                await queue.addTrack(currentSong)
                queue.skip()
                interaction.reply({content: `Playing ${track.title} immediately`, embeds: [], ephermal: sendAsEphermal})
            } else {
                queue.insert(track, position - 1)
                interaction.reply({content: `Inserted ${track.title} at position **${position}**`, embeds: [], ephermal: sendAsEphermal})
            }
            client.functions.get('log').execute(interaction.guildId, `Player playing immediately`)
        }

        if (!requestedSong.match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/)) {
            if (client.usersInMessageReactions.includes(interaction.member.id)) {
                return interaction.reply({content: "Please wait until your previous interaction is over", sendAsEphermal})
            }
			const numberOfSongs = Math.min(5, song.tracks.length)
            const embed = new EmbedBuilder()
            .setTitle("Please select a video")
            .setDescription('Type in a number 1-5 to select your video')
            for(i=0;i<numberOfSongs;i++) {
                var track = song.tracks[i]
                embed.addFields(
                {name: `${i + 1}: ${track.title}`, value: `Author: ${track.author}`, inline: true},
                {name: track.duration, value: `[${track.source}](${track.url})`, inline: true},
                {name: '\u200B', value: "\u200B", inline: true},
            )}
			embed.addFields({name: `Type anything else to quit`, value:"\u200b", inline:false})
            interaction.editReply({embeds: [embed]})
            const filter = (message) => message.author.id == interaction.member.id
            const collector = interaction.channel.createMessageCollector({filter, max:1, time:15000})
            client.usersInMessageReactions.push(interaction.member.id)
            collector.on('end', async collected => {
                const index = client.usersInMessageReactions.indexOf(interaction.member.id)
                if (index > -1) {
                    client.usersInMessageReactions.splice(index, 1)
                }
                if (collected.size == 0) {return interaction.reply({content: "Timed out", embeds: [], ephermal: sendAsEphermal})}
				collected.first().delete()
				if (collected.first().content.match(/([1-5])/)) {
					interaction.reply({content: `Selected video ${collected.first().content}`, ephermal: sendAsEphermal});
					await insertTrack(song.tracks[parseInt(collected.first().content) - 1])
					return
				}
				return interaction.reply({content: "Message wasn't a number between 1-5", embeds: [], ephermal: sendAsEphermal})
            })
        } else {
            await insertTrack(song.tracks[0])
        }
    }
}