module.exports = (client, queue, track) => {
    client.functions.get('sendQueue').execute(client, queue, track)
}