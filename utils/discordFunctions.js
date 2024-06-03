async function sendMessage(interaction, messageContent, options = {}) {
	var isEphemeral = options.ephemeral;
	var deletionTime = options.deletionTime ? options.deleteionTime : 15000
	var embeds = options.embeds ? options.embeds : []
	var attachments = options.attachments ? options.attachments : [];
	if (interaction.replied || interaction.deferred) {
		return interaction.editReply({ content: messageContent, embeds: embeds, ephemeral: isEphemeral, files: attachments });
	}
	if (deletionTime != "inf") {
		await interaction.reply({ content: messageContent, embeds: embeds, ephemeral: isEphemeral, files: attachments }).then(function (message) {
			setTimeout(() => { message.delete() }, 15000)
		})
		return
	}
	await interaction.reply({ content: messageContent, embeds: embeds, ephemeral: isEphemeral, files: attachments })

}

module.exports = { sendMessage }