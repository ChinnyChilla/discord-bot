module.exports = (client, queue) => {
    client.functions.get('deleteQueue').execute(client, queue)
    console.log(`Queue Ended (${queue.guild.id})`)
    
}