module.exports = (client, queue, track) => {
    client.functions.get('updateQueue').execute(client, queue)
}