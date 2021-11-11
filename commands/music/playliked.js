const { resolve } = require('path')

module.exports = {
    name: 'playlike',
    description: 'Play your liked music playlist',
    category: 'music',
    options: [{
        type: 5,
        name: 'shuffle',
        description: "Shuffle the queue"
    }],
    async execute(client, interaction) {
        if (!interaction.member.voice.channel) {
            return interaction.editReply("Please join a voice channel")
        }
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
                    queue.addTracks(tracks)
                    if (interaction.options.get('shuffle')) {
                        if (interaction.options.get('shuffle').value) {
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
    }
}
