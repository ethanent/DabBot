const path = require('path')
const ofs = require('fs')
const Discord = require('discord.js')
const poky = require('poky')
const createRichEmbed = require(path.join(__dirname, 'lib', 'createRichEmbed.js'))
const memberData = require(path.join(__dirname, 'lib', 'memberData.js'))

const config = JSON.parse(ofs.readFileSync(path.join(__dirname, 'config.json')))

const client = new Discord.Client()

let recentDabs = []

setInterval(() => {
	recentDabs = []
}, 2 * 60 * 1000)

client.on('ready', async () => {
	await client.user.setPresence({
		'game': {
			'name': 'everyone dab',
			'type': 'WATCHING'
		},
		'status': 'online'
	})

	console.log('Started completely.')
})

// Commands

client.on('message', async (message) => {
	if (message.author.bot) return
	if (!message.member) return

	if (message.content.indexOf('!') === 0) {
		const segments = message.content.substring(1).split(' ')
		const command = segments[0]

		console.log(command + ' command by ' + message.author.username)

		const senderData = await memberData.getMember(message.member.id)

		switch (command) {
			case 'dabs':
				await message.channel.send(createRichEmbed('Dab Score', 'You\'ve dabbed **' + senderData.dabs + '** time' + (senderData.dabs !== 1 ? 's' : '') + '.'))
				break
			case 'info':
				await message.channel.send(createRichEmbed('DabBot Information', 'I\'m DabBot, an [ethanent](https://ethanent.me) project.\n\nTo get DabBot on your server, click [here](https://discordapp.com/api/oauth2/authorize?client_id=468617622867410944&permissions=8&redirect_uri=https%3A%2F%2Fethanent.me&scope=bot).\nGiHub repository: [ethanent/DabBot](https://github.com/ethanent/DabBot)\nTwitter: [@ethanent](https://twitter.com/ethanent)'))
				break
			case 'leaderboards':
			case 'leaderboard':
			case 'dabbers':
			case 'leaders':
			case 'boards':
				let leaderMems = await memberData.getAllMembers()

				leaderMems = leaderMems.sort((a, b) => a.dabs > b.dabs ? -1 : 1)

				let boardContent = ''

				for (let i = 0; i < 5; i++) {
					if (!leaderMems[i]) break

					boardContent = boardContent + (i + 1) + '. ' + (await client.fetchUser(leaderMems[i].id)) + ' - ' + leaderMems[i].dabs + ' dabs\n'
				}

				await message.channel.send(createRichEmbed('-=-=- Dab Leaderboards -=-=-', boardContent))
				break
			case 'eval':
				if (message.member.id === '249963809119272960') {
					let evalCode = message.content.substring(command.length + 2)
					console.log('Eval: ' + evalCode)

					let evalRes

					try {
						evalRes = eval(evalCode)
					}
					catch (err) {
						evalRes = err
					}

					await message.channel.send(createRichEmbed('Eval Result', '```\n' + evalRes + '\n```'))
				}
				break
		}
	}
})

// Dab detection

client.on('message', async (message) => {
	if (message.author.bot) return
	if (!message.member) return

	const senderData = await memberData.getMember(message.member.id)

	const serverDabEmoji = message.guild.emojis.array().filter((emoji) => emoji.name.toLowerCase().includes('dab'))

	let dabbed = false
	let dabCount = 0

	for (let i = 0; i < serverDabEmoji.length; i++) {
		if (message.content.includes(serverDabEmoji[i].toString())) {
			dabbed = true
			dabCount++
		}
	}

	if (dabbed) {
		if (!message.guild.me.hasPermission('ADMINISTRATOR')) {
			await message.channel.send(createRichEmbed('Dab Error', 'I need the **Administrator** permission to qualify dabs!', null, true))

			return
		}

		if (recentDabs.includes(message.member)) {
			let sentWM = await message.channel.send(createRichEmbed('Dab Dab too fast?', 'Your Dab Score didn\'t increase because you\'re dabbing too much now.\n*hold off for like 2 minutes*', null, true))

			await poky(3000)

			await sentWM.delete()

			return
		}

		recentDabs.push(message.member)

		let sendContent = config.dabMessages.find((message) => message.count === dabCount)

		if (!sendContent) sendContent = {
			'title': dabCount + '-' + 'dab',
			'description': 'You\'re quite the dab legend. You\'ve performed a ' + dabCount + '-dab.'
		}

		console.log(sendContent.title + ' by ' + message.author.username + '#' + message.author.discriminator)

		const sentM = await message.channel.send(createRichEmbed(sendContent.title, sendContent.description))

		senderData.dabs++

		await memberData.setMember(message.member.id, senderData)

		await poky(3000)

		await sentM.delete()
	}
})

client.login(config.token)