module.exports = (queue, track) => {
    const guildID = queue.metadata.guild.id
    const discordEmbed = client.queueEmbeds.get(guildID)
    if (!discordEmbed) {
        var wait = setInterval(() => {
            const discordEmbed = client.queueEmbeds.get(guildID)
            if(discordEmbed) {
                clearInterval(wait)
                goOn()
            }
        }, 1000)
    } else {goOn()}
    function goOn() {
        const discordEmbed = client.queueEmbeds.get(guildID)
        discordEmbed.setTitle(`${track.title} Added!`)
        discordEmbed.setURL(track.url)
        setTimeout(() => {
            client.functions.get('sendQueue').execute(client, message)
        }, 10000)
    }
}