const {ApplicationCommandOptionType, EmbedBuilder} = require('discord.js')
const queueInfo = require("../../functions/createQueueInfoClass.js")
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
            type: ApplicationCommandOptionType.Boolean,
            name: 'shuffle',
            description: "Shuffle the queue when you add it."
        }
    ],
    
    async execute(client, interaction) {
		const sendAsEphermal = true;
        if (!interaction.member.voice.channel) {
            return interaction.reply({content: "Please join a voice channel", ephemeral: sendAsEphermal})
        }
        const requestedSong = interaction.options.getString('song')
        const shuffle = interaction.options.getBoolean('shuffle')
        var firstTime = false
        if (!client.player.getQueue(interaction.guild)) {firstTime = true}
        var queue = client.player.createQueue(interaction.guild, {ytdlOptions: {
            filter: 'audioonly', 
            quality: 'highest',
            highWaterMark: 1 << 25,
            dlChunkSize: 0,
            },
            metadata: interaction
            })
            
        if (interaction.channel.id != queue.metadata.channel.id) {
            return interaction.reply({content: `For this server, the music commands only work in <#${queue.metadata.channel.id}>`, ephemeral: sendAsEphermal})
        }
        
        const song = await client.player.search(requestedSong, {
            requestedBy: interaction.member
        })
        if (!song.tracks[0]) {
            client.functions.get('deleteQueue').execute(client, interaction.guild.id)
            return interaction.reply({content: "Could not find song!", ephermal: sendAsEphermal})
        }
        var index = 0

        async function play() {
            if (!client.queueInfo.get(interaction.guild.id)) {
                const queueMessage = await interaction.channel.send(`Bound to <#${interaction.channel.id}>`)
                var queueInfotemp = new queueInfo(queueMessage, queue)
				await client.queueInfo.set(interaction.guild.id, queueInfotemp)
            }
            if (shuffle) {
                if (firstTime) {
                    await queue.addTrack(queue.tracks[0])
                    await queue.shuffle()
                    await queue.remove(0)
                } else {
                    await queue.shuffle()
                }
            }
            try {
                    if (!queue.connection) {await queue.connect(interaction.member.voice.channel)}
                } catch {
                    interaction.reply({content: "Failed to join your voice channel!", ephemeral: sendAsEphermal})
                }

            client.functions.get('log').execute(interaction.guildId, `Player added song(s)`)
            if (!queue.playing) {await queue.play()}
        }
        if (!requestedSong.match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/)) {
            if (client.usersInMessageReactions.includes(interaction.member.id)) {
                return interaction.reply({content: "Please wait until your previous interaction is over", ephemeral: sendAsEphermal})
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
            interaction.reply({embeds: [embed], ephemeral: sendAsEphermal})
            const filter = (message) => message.author.id == interaction.member.id
            const collector = interaction.channel.createMessageCollector({filter, max:1, time:15000})
            client.usersInMessageReactions.push(interaction.member.id)
            collector.on('end', async collected => {
                const index = client.usersInMessageReactions.indexOf(interaction.member.id)
                if (index > -1) {
                    client.usersInMessageReactions.splice(index, 1)
                }
                if (collected.size == 0) {return interaction.editReply({content: "Timed out", embeds: []})}
				collected.first().delete()
                if (collected.first().content.match(/([1-5])/)) {
					number = parseInt(collected.first().content)
					if (!(0 < number < 6)) {return interaction.editReply("Number too big or small")}
                    await queue.addTrack(song.tracks[number - 1])
                    play()
                    interaction.editReply({content: `Selected video ${collected.first().content}`, embeds: []})
                    return
                }
                return interaction.editReply({content: `Message wasn't a number between 1-${numberOfSongs}`, embeds: []})
            })
        } else {
            if (song.playlist) {
				console.log("im here")
                interaction.reply({content: `Playlist ${song.playlist.title} added!`, ephemeral: sendAsEphermal})
                await queue.addTracks(song.playlist.tracks)
                play()
            } else {
                interaction.reply({content: `Track ${song.tracks[index].title} added!`, ephemeral: sendAsEphermal});
                await queue.addTrack(song.tracks[index])
                play()
            }
        }
    }
}
