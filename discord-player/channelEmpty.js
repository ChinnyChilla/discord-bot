module.exports = (client, queue) => {
    client.functions.get('deleteQueue').execute(client, queue)
}