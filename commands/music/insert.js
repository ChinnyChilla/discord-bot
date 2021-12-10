const {MessageEmbed} = require('discord.js')
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
        async function insertTrack(track) {
            if (position == 0) {
                await queue.insert(track, 0)
                const currentSong = queue.nowPlaying()
                await queue.addTrack(currentSong)
                queue.skip()
                interaction.editReply("Playing song immediately")
            } else {
                queue.insert(track, position - 1)
                interaction.editReply(`Inserted song at position **${position}**`)
            }
            client.functions.get('log').execute(interaction.guildId, `Player playing immediately`)
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
                if (collected.first().content.match(/([1-5])/)) {
                    interaction.editReply(`Selected video ${collected.first().content}`)
                    await insertTrack(song.tracks[parseInt(collected.first().content) - 1])
                    return
                }
                return interaction.editReply({content: "Message wasn't a number between 1-5", embeds: []})
            })
        } else {
            interaction.editReply(`Track ${song.tracks[0].title} added!`)
            await queue.addTrack(song.tracks[0])
        }
    }
}