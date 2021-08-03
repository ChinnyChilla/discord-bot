module.exports = (client, message, queue) => {
    message.channel.send('\u200B').then(async function (message) {
        client.queueMessages.set(message.guild.id, message)
        console.log(`Set message to ${message.guild.id}`)
        await message.react('❤️')
        const filter = (reaction, user) => {return reaction.emoji.name === '❤️'}
        const collector = message.createReactionCollector(filter)
        collector.on('collect', (reaction, user) => {
            console.log("Collected one react")
        })
    })
}