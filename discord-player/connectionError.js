module.exports = (client, queue, error) => {
    console.error("Connection error")
    const interaction = queue.metadata
    client.functions.get('interactionEdit').execute(interaction, "Connection error")
}