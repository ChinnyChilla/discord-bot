module.exports = (client, message, queue, playlist) => {
    client.functions.get('sendMessageTemp').execute(message, "Playlist Added")
    if (queue.tracks > 1) {client.functions.get('sendQueue').execute(client, message)}
}