const { QueryType } = require('discord-player')
const {ApplicationCommandOptionType, EmbedBuilder} = require('discord.js')
const {sendMessage} = require('../../functions/sendMessage')
const { Player } = require('discord-player')
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
		const player = Player.singleton();
        const queue = player.nodes.get(interaction.guild.id);
        if (!queue) {return sendMessage(client, interaction,  "There is currently no queue!", {ephemeral: true})}
        if (interaction.channel.id != queue.metadata.channel.id) {
            return sendMessage(client, interaction, `For this server, the music commands only work in <#${queue.metadata.channel.id}>`, {ephemeral: true})
        }
        const requestedSong = interaction.options.getString('song')
        const position = interaction.options.getInteger('position')
        if (position < 0) {return sendMessage(client, interaction, "Invalid position")}

        const song = await player.search(requestedSong, {
            requestedBy: interaction.member,
			searchEngine: QueryType.AUTO
        })
        if (!song.tracks[0]) {return sendMessage(client, interaction, "Could not find song!",{ ephemeral: true})}
        async function insertTrack(track) {
            if (position == 0) {
                await queue.insertTrack(track, 0)
                const currentTrack = queue.currentTrack
                await queue.addTrack(currentTrack)
                queue.node.skip()
                sendMessage(client, interaction,  `Playing ${track.title} immediately`, {embeds: [], ephemeral: true})
            } else {
                queue.insertTrack(track, position - 1)
                sendMessage(client, interaction,  `Inserted ${track.title} at position **${position}**`, {embeds: [], ephemeral: true})
            }
            client.functions.get('log').execute(interaction.guildId, `Player playing immediately`)
        }

        if (!requestedSong.match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/)) {
            if (client.usersInMessageReactions.includes(interaction.member.id)) {
                return sendMessage(client, interaction, "Please wait until your previous interaction is over", {ephemeral: true})
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
            sendMessage(client, interaction, "", {embeds: [embed]})
            const filter = (message) => message.author.id == interaction.member.id
            const collector = interaction.channel.createMessageCollector({filter, max:1, time:15000})
            client.usersInMessageReactions.push(interaction.member.id)
            collector.on('end', async collected => {
                const index = client.usersInMessageReactions.indexOf(interaction.member.id)
                if (index > -1) {
                    client.usersInMessageReactions.splice(index, 1)
                }
                if (collected.size == 0) {
					queueUtils.deleteQueue(queue);
					sendMessage(client, interaction,  "Timed out", {embeds: [], ephemeral: true})
					return;
				}
				collected.first().delete()
				if (collected.first().content.match(/([1-5])/)) {
					sendMessage(client, interaction,  `Selected video ${collected.first().content}`, {ephemeral: true});
					await insertTrack(song.tracks[parseInt(collected.first().content) - 1])
					return
				}
				queueUtils.deleteQueue(queue);
				sendMessage(client, interaction, "Message wasn't a number between 1-5", {embeds: [], ephemeral: true})
				return 
            })
        } else {
            await insertTrack(song.tracks[0])
        }
    }
}