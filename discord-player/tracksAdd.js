module.exports = (client, queue, tracks) => {
    client.functions.get('updateQueue').execute(client, queue)
}