module.exports = (client, message, track, queue) => {
    client.functions.get('sendQueue').execute(client, message)
    client.user.setPresence({ status: 'online' })
    
}