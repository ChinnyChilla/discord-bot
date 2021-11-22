module.exports = {
    name: 'insert',
    description: 'Insert the song',
    category: 'music',
    options: [
        {
            type: 3,
            name: "song",
            description: "Song URL/Title or Playlist URL",
            required: true,
        },
        {
            type: 4,
            name: 'position',
            description: "Where to put it (0 is instantly playing)",
            required: true
        }
    ],
    async execute(client, interaction) {
        
        const queue = client.player.getQueue(interaction.guild)
        if (!queue) {return interaction.editReply("There is currently no queue!")}
        if (interaction.channel.id != queue.metadata.channel.id) {
            return interaction.editReply(`For this server, the music commands only work in <#${queue.metadata.channel.id}>`)
        }
        const requestedSong = interaction.options.getString('song')
        const position = interaction.options.getInteger('position')
        if (position < 0) {return interaction.editReply("Invalid position")}

        const song = await client.player.search(requestedSong, {
            requestedBy: interaction.member
        })
        if (!song.tracks[0]) {return interaction.editReply("Could not find song!")}

        if (position == 0) {
            await queue.insert(song.tracks[0], 0)
            const currentSong = queue.nowPlaying()
            await queue.addTrack(currentSong)
            queue.skip()
            interaction.editReply("Playing song immediately")
        } else {
            queue.insert(song.tracks[0], position - 1)
            interaction.editReply(`Inserted song at position **${position}**`)
        }
        client.functions.get('log').execute(interaction.guildId, `Player playing immediately`)
    }
}