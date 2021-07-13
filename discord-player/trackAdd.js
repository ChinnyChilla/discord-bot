module.exports = (client, message, queue, track) => {
    client.functions.get('sendMessageTemp').execute(message, `${track.title} Added!`)
    client.functions.get('sendQueue').execute(client, message)
}