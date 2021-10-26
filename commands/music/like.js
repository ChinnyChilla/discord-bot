module.exports = {
    name: 'like',
    description: 'Like a song',
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
        const path = require('path');
        const fs = require('fs');
        const reqPath = path.join(__dirname, '../../data/likedSongs.json')
        const likedSongs = require(reqPath)
        console.log(interaction.options.get('song').value)
        const song = await client.player.search(interaction.options.get('song').value, {})

        var userLikedSongs = likedSongs[interaction.member.id]
        if (!userLikedSongs) {
            userLikedSongs = new Array();
        }
        if (song.playlist) {
            var alreadyLiked = 0
            song.playlist.tracks.forEach(track => {

                const index = userLikedSongs.indexOf(track.url);
                if (index > -1) {
                    alreadyLiked++;
                } else {
                    userLikedSongs.push(track.url)
                }
            })
            interaction.editReply(`Added ${song.playlist.tracks.length - alreadyLiked} to your liked playlist!\n(${alreadyLiked} songs were already liked)`)
            } else {
            if (!(index > -1)) {
                userLikedSongs.push(song[0].url)
                interaction.editReply(`Added ${song.title} to your liked playlist!`).then(message => {
                    setTimeout(() => message.delete(), 10000)
                })
            }
        }
        likedSongs[interaction.member.id] = userLikedSongs
        fs.writeFile(reqPath, JSON.stringify(likedSongs), function(err) {
            if (err) {
                console.error(`An Error has occured! ${err}`)
            }
        })
    }
}