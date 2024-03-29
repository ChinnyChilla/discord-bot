module.exports.sendMessage = async function(client, interaction, messageContent, options={}) {
	var isEphemeral = options.ephemeral;
	var deletionTime = options.deletionTime ? options.deleteionTime : 15000
	var embeds = options.embeds ? options.embeds : []
	var attachments = options.attachments ? options.attachments : [];
	if (interaction.replied || interaction.deferred) {
		return interaction.editReply({content: messageContent, embeds: embeds, ephemeral: isEphemeral, files: attachments});
	}
	client.functions.get("log").execute(interaction.guild.id, `Interaction reply to ${interaction.member.displayName}\t Content: ${messageContent} | Embeds ${embeds.length} | optionCount: ${Object.keys(options).length}`)
	if (deletionTime != "inf") {
		await interaction.reply({content: messageContent, embeds: embeds, ephemeral: isEphemeral, files: attachments}).then(function(message) {
		setTimeout(() => {message.delete()}, 15000)
		})
		return
	}
	await interaction.reply({content: messageContent, embeds: embeds, ephemeral: isEphemeral, files: attachments})
	
}
