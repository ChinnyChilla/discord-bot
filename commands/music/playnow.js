module.exports = {
    name: 'playnow',
    description: 'Plays the song immediately',
    category: 'music',
    options: [
        {
            type: 3,
            name: "song",
            description: "Song URL/Title or Playlist URL",
            required: true,
        },
    ],
    async execute(client, interaction) {
        
        const queue = client.player.getQueue(interaction.guild)
        if (!queue) {return interaction.editReply("There is currently no queue!")}
        console.log(interaction.channel.id)
        if (interaction.channel.id != queue.metadata.channel.id) {
            return interaction.editReply(`For this server, the music commands only work in <#${queue.metadata.channel.id}>`)
        }
        const options = interaction.options.data
        const args = {}
        for (const option of options) {
            const {name, value} = option
            args[name] = value
        }
        
        const song = await client.player.search(args['song'], {
            requestedBy: interaction.member
        })
        const currentSong = queue.nowPlaying()
        await queue.addTrack(currentSong)
        if (song.playlist) {
            const tracks = song.playlist.tracks
            await queue.insert(tracks.splice(0))
            queue.addTracks(tracks)
            queue.skip()
            interaction.editReply("Playing first track of playlist immediately. \n The rest of the tracks are at the end of the queue")
        } else {
            await queue.insert(song.tracks[0], 0)
            queue.skip()
            interaction.editReply("Playing song immediately!")
        }
        client.functions.get('log').execute(interaction.guildId, `Player playing immediately`)
    }
}