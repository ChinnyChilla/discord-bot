module.exports = (client, message, queue, track) => {
        
    const discordEmbed = client.queueEmbeds.get(message.guild.id)
    if (!discordEmbed) {
        var wait = setInterval(() => {
            const discordEmbed = client.queueEmbeds.get(message.guild.id)
            if(discordEmbed) {
                clearInterval(wait)
                goOn()
            }
        }, 1000)
    } else {goOn()}
    function goOn() {
        const discordEmbed = client.queueEmbeds.get(message.guild.id)
        discordEmbed.setTitle(`${track.title} Added!`)
        discordEmbed.setURL(track.url)
        setTimeout(() => {
            client.functions.get('sendQueue').execute(client, message)
        }, 10000)
    }
}