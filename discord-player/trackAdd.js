module.exports = (client, message, queue, track) => {
    const func = client.functions.get('sendMessageTemp')
    client.functions.get('sendQueue').execute(client, message)
}