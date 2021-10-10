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
            name: "liked",
            description: "Play your liked songs playlist (overrides the song query)"
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
        

        const options = interaction.options.data
        const args = {}
        for (const option of options) {
            const {name, value} = option
            args[name] = value
        }
        var queue = client.player.createQueue(interaction.guild, {metadata: interaction})
        if (interaction.channel.id != queue.metadata.channel.id) {
            return interaction.editReply(`For this server, the music commands only work in <#${queue.metadata.channel.id}>`)
        }
        if (!client.queueMessages.get(interaction.guild.id)) {
            const queueMessage = await interaction.channel.send(`Bound to <#${interaction.channel.id}>`)
            client.queueMessages.set(interaction.guild.id, queueMessage)
        }
        
        const song = await client.player.search(args['song'], {
            requestedBy: interaction.member
        })
        if (args['liked']) {
            return interaction.editReply('WIP')
        }
        try {
                if (!queue.connection) {await queue.connect(interaction.member.voice.channel)}
            } catch {
                interaction.editReply("Failed to join your voice channel!")
            }
        if (song.playlist) {
            interaction.editReply(`Playlist ${song.playlist.title} added!`)
            await queue.addTracks(song.playlist.tracks)
        } else {
            interaction.editReply(`Track ${song.tracks[0].title} added!`)
            await queue.addTrack(song.tracks[0])
        }
        if (args['shuffle']) {
            await queue.shuffle()
        }
        client.functions.get('log').execute(interaction.guildId, `Player added song(s)`)
        if (!queue.playing) {await queue.play()}
    }
}
