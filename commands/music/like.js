const path = require('path');
const fs = require('fs');
const reqPath = path.join(__dirname, '../../data/likedSongs.json');

module.exports = {
    name: 'like',
    description: 'Everything with your liked playlist',
    category: 'music',
    options: [
        {
            type: 1,
            name: "song",
            description: "Like a song",
            options: [{
                type: 3,
                name: 'song',
                description: 'Song URL/Title or Playlist URL to add to your playlist',
                required: true,
            }],

        },
        {
            type: 1,
            name: "play",
            description: 'Play your liked songs!',
            options: [{
                type: 5,
                name: 'shuffle',
                description: "Shuffle liked songs",
            }],
        },
        {
            type: 1,
            name: "list",
            description: "List your current liked songs"
        }
    ],
    async execute(client, interaction) {
        const likedSongs = require(reqPath)
        var userLikedSongs = likedSongs[interaction.member.id]

        try {
            var subCommand = interaction.options.getSubcommand()
        } catch (err) {
            return interaction.editReply("Please use one of the other subcommands!")
        }
        if (subCommand == 'song') {
            const song = await client.player.search(interaction.options.getString('song'), {})
            if (!song.tracks[0]) {return interaction.editReply("Could not find song!")}
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
                const firstSong = song.tracks[0]
                const index = userLikedSongs.indexOf(firstSong.url);
                if (!(index > -1)) {
                    userLikedSongs.push(firstSong.url)
                    interaction.editReply(`Added ${firstSong.title} to your liked playlist!`).then(message => {
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
        } else if (subCommand == 'play') {
            if (!interaction.member.voice.channel) {
                return interaction.editReply("Please join a voice channel")
            }
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
            const fs = require('fs');
            const path = require('path');
            const reqPath = path.join(__dirname, '../../data/likedSongs.json')
            const data = require(reqPath)
            if (!data[interaction.member.id] || data[interaction.member.id].length == 0) {return interaction.editReply("Please first like some songs!")}

            const songs = data[interaction.member.id]
            if (!client.queueMessages.get(interaction.guild.id)) {
                const queueMessage = await interaction.channel.send(`Bound to <#${interaction.channel.id}>`)
                client.queueMessages.set(interaction.guild.id, queueMessage)
            }

            var promises = new Array();
            songs.forEach(async song => {
                promises.push(new Promise((resolve, reject) => {
                    client.player.search(song, {
                        requestedBy: interaction.member
                    }).then(searchedSongs => {
                        resolve(searchedSongs.tracks[0])
                    })
                }))
            })
            async function checkPromises() {
                return new Promise((resolve, reject) => {
                    var listofTracks = new Array();
                    Promise.all(promises).then(async (tracks) => {
                        await queue.addTracks(tracks)
                        if (interaction.options.getBoolean('shuffle')) {
                            if (firstTime) {
                                await queue.addTrack(queue.tracks[0])
                                await queue.shuffle()
                                await queue.remove(0)
                            } else {
                                queue.shuffle()
                            }
                        }
                        resolve()
                    })
                })

            }
            checkPromises().then(async result => {
                interaction.editReply("Playing all your liked songs!")
                try {
                    if (!queue.connection) {await queue.connect(interaction.member.voice.channel)}
                } catch {
                    interaction.editReply("Failed to join your voice channel!")
                }
                client.functions.get('log').execute(interaction.guildId, `Playing liked songs`)
                if (!queue.playing) {await queue.play()}
            })
        } else if (subCommand == 'list') {
            interaction.editReply("WIP")
        }
    }
}