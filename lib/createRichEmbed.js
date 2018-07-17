const Discord = require('discord.js')

module.exports = (title, description, footer, error) => {
	const embed = new Discord.RichEmbed({
		title,
		description
	})

	embed.setColor(error ? '#E74C3C' : '#FFCC4D')
	if (footer) embed.setFooter(footer)

	return embed
}