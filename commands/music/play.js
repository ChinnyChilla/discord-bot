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
        }
    ],
    
    async execute(client, interaction) {
        const interactionEdit = client.functions.get("interactionEdit")
        if (!interaction.member.voice.channel) {
            return interaction.editReply("Please join a voice channel")
        }
        

        const options = interaction.options.data
        const args = {}
        for (const option of options) {
            const {name, value} = option
            args[name] = value
        }
        var queue = client.player.getQueue(interaction.guild)
        if (!queue) {queue = client.player.createQueue(interaction.guild, {metadata: interaction})}
        if (!client.queueMessages.get(interaction.guild.id)) {
            const queueMessage = await interaction.channel.send('\u200B')
            client.queueMessages.set(interaction.guild.id, queueMessage)
        }
        
        const song = await client.player.search(args['song'], {
            requestedBy: interaction.member
        })
        if (args['liked']) {
            return interaction.editReply('will add later')
        }

        try {
            await queue.connect(interaction.member.voice.channel)
        } catch {
            console.error("Failed to join voice channel")
            interaction.editReply("Failed to join your voice channel!")
        }
        if (song.playlist) {
            interaction.editReply("Tracks added!")
            await queue.addTracks(song.playlist.tracks)
        } else {
            interaction.editReply("Track added!")
            await queue.addTrack(song.tracks[0])
        }
        if (!queue.playing) {queue.play()}
    }
}
