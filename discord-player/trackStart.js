module.exports = (client, message, track, queue) => {
    console.log(`Starting song ${track.title}`)
    client.functions.get('sendQueue').execute(client, message)
    
}