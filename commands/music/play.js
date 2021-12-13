const {MessageEmbed, Message} = require('discord.js')
module.exports = {
    name: 'play',
    description: 'Plays a song',
    category: 'music',
    options: [
        {
            type: 3,
            name: "song",
            description: "Song URL/Title or Playlist URL",
            required: true,
        },
        {
            type: 5,
            name: 'shuffle',
            description: "Shuffle the queue when you add it."
        }
    ],
    
    async execute(client, interaction) {
        if (!interaction.member.voice.channel) {
            return interaction.editReply("Please join a voice channel")
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
            return interaction.editReply(`For this server, the music commands only work in <#${queue.metadata.channel.id}>`)
        }
        
        const song = await client.player.search(requestedSong, {
            requestedBy: interaction.member
        })
        if (!song.tracks[0]) {
            client.functions.get('deleteQueue').execute(client, interaction.guild.id)
            return interaction.editReply("Could not find song!")
        }
        var index = 0

        async function play() {
            if (!client.queueMessages.get(interaction.guild.id)) {
                const queueMessage = await interaction.channel.send(`Bound to <#${interaction.channel.id}>`)
                client.queueMessages.set(interaction.guild.id, queueMessage)
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
                    interaction.editReply("Failed to join your voice channel!")
                }

            client.functions.get('log').execute(interaction.guildId, `Player added song(s)`)
            if (!queue.playing) {await queue.play()}
        }
        if (!requestedSong.match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/)) {
            const embed = new MessageEmbed()
            .setTitle("Please select a video")
            .setDescription('Type in a number 1-5 to select your video')
            for(i=0;i<5;i++) {
                var track = song.tracks[i]
                embed.addFields(
                {name: `${i + 1}: ${track.title}`, value: `Author: ${track.author}`, inline: true},
                {name: track.duration, value: `[${track.source}](${track.url})`, inline: true},
                {name: '\u200B', value: "\u200B", inline: true},
            )}
            interaction.editReply({embeds: [embed]})
            const filter = (message) => message.author.id == interaction.member.id
            const collector = interaction.channel.createMessageCollector({filter, max:1, time:15000})
            collector.on('end', async collected => {
                if (collected.size == 0) {return interaction.editReply({content: "Timed out", embeds: []})}
				collected.first().delete()
                if (collected.first().content.match(/([1-5])/)) {
                    await queue.addTrack(song.tracks[parseInt(collected.first().content) - 1])
                    interaction.editReply({content: `Selected video ${collected.first().content}`, embeds: []})
                    play()
                    return
                } 
                return interaction.editReply({content: "Message wasn't a number between 1-5", embeds: []})
            })
        } else {
            if (song.playlist) {
                interaction.editReply(`Playlist ${song.playlist.title} added!`)
                await queue.addTracks(song.playlist.tracks)
                play()
            } else {
                interaction.editReply(`Track ${song.tracks[index].title} added!`)
                await queue.addTrack(song.tracks[index])
                play()
            }
        }
    }
}
