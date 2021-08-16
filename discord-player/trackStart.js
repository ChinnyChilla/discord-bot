module.exports = (queue, track) => {
    client.functions.get('sendQueue').execute(client, message)
    client.user.setPresence({ status: 'online' })
    
}