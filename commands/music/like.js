const path = require('path');
const fs = require('fs');
const reqPath = path.join(__dirname, '../../data/likedSongs.json');
const {ApplicationCommandOptionType} = require('discord.js')
const { Player } = require('discord-player');
const musicUtil = require('../../utils/musicFunctions.js')
const discordFuncs = require('../../utils/discordFunctions.js')

module.exports = {
    name: 'like',
    description: 'Everything with your liked playlist',
    category: 'music',
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "song",
            description: "Like a song",
            options: [{
                type: ApplicationCommandOptionType.String,
                name: 'song',
                description: 'Song URL/Title or Playlist URL to add to your playlist',
                required: true,
            }],

        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "play",
            description: 'Play your liked songs!',
            options: [{
                type: ApplicationCommandOptionType.Boolean,
                name: 'shuffle',
                description: "Shuffle liked songs",
            }],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "list",
            description: "List your current liked songs"
        }
    ],
    async execute(client, interaction) {
		await discordFuncs.deferReply(interaction);
		const player = Player.singleton();
        const likedSongs = require(reqPath)
        var userLikedSongs = likedSongs[interaction.member.id]

        try {
            var subCommand = interaction.options.getSubcommand()
        } catch (err) {
            return interaction.editReply("Please use one of the other subcommands!")
        }
        if (subCommand == 'song') {
            const song = await player.search(interaction.options.getString('song'), {})
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
						setTimeout(() => message.delete().catch(err => console.log("Message already deleted")), 10000)
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
            const queue = player.nodes.get(interaction.guild.id);
            if (queue && (interaction.channel.id != queue.metadata.channel.id)) {
                return interaction.editReply(`For this server, the music commands only work in <#${queue.metadata.channel.id}>`)
            }
            const fs = require('fs');
            const path = require('path');
            const reqPath = path.join(__dirname, '../../data/likedSongs.json')
            const data = require(reqPath)
            if (!data[interaction.member.id] || data[interaction.member.id].length == 0) {return interaction.editReply("Please first like some songs!")}

            const songs = data[interaction.member.id]

            var promises = new Array();
            songs.forEach(async song => {
                promises.push(new Promise((resolve, reject) => {
                    player.search(song, {
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
                        await musicUtil.addTracks(interaction, tracks);
                        resolve()
                    })
                })

            }
            checkPromises().then(async result => {
                interaction.editReply("Playing all your liked songs!")
            })
        } else if (subCommand == 'list') {
            interaction.editReply("WIP")
        }
    }
}