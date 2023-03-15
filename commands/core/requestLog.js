const  {PermissionsBitField, Attachment} = require('discord.js')
const { sendMessage } = require('../../functions/sendMessage')
const path = require('path')
module.exports = {
    name: 'requestlog',
    category: 'core',
    description: 'Retrieve the current logs for this server',
    async execute(client, interaction) {
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.ViewAuditLog)) {
            return sendMessage(client, interaction, "You need the ***ViewAuditLog*** permission to view this file!")
        }
		const reqPath = path.join(__dirname, `../../logs/${interaction.guild.id}.log`)
		return sendMessage(client, interaction, "Here is your log file", {attachments: [reqPath], ephemeral: true})
	}	
}