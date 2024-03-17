const { Events, AttachmentBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {

			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(`Error executing ${interaction.commandName}`);
				console.error(error);
			}
		} else if (interaction.isButton()) {

			const customId = interaction.customId;

			if (customId !== 'Export Product') {
				return;
			}

			const embedData = interaction.message.embeds[0].data;
			let replysent = false;

			try {
				
				const embedData = interaction.message.embeds[0].data;
				const componentData = interaction.message.components[0].components;
				let jsonContent = {};

				await interaction.deferReply({ ephemeral: true });
				replysent = true;
				// await interaction.editReply('Pong!');
				
				jsonContent['keyword'] = embedData.title;
				jsonContent['image_url'] = embedData.image.url;
				jsonContent['product_url'] = componentData[0].url;
				jsonContent['product_description'] = embedData.description;
				jsonContent['price'] = embedData.fields[0].value.slice(2);
				jsonContent['ratings'] = embedData.fields[1].value.slice(2);
				jsonContent['sales_amount'] = embedData.fields[2].value.slice(2);
				jsonContent['store_name'] = embedData.fields[3].value.slice(2);
				jsonContent['store_url'] = componentData[1].url;

				// console.log(interaction.message.components[0].components[0].url);
				// console.log(jsonContent);

				const csvHeaders = Object.keys(jsonContent).join(',');
				const csvValues = Object.values(jsonContent).map(value => {
					if (value.includes(',')) {
						return `"${value}"`;
					}
					return value;
				}).join(',');

				const csvData = `${csvHeaders}\n${csvValues}`;

				const attachment = new AttachmentBuilder(Buffer.from(csvData), { name: 'data.csv' });

				await interaction.editReply({ content: `Exported CSV file of the product **\`${embedData.title}\`**`, files: [attachment] });
				
				// console.log('CSV file sent successfully');
				
			} catch (error) {
				console.error('Failed to send CSV file:', error);
				if (!replysent) {
					await interaction.deferReply({ ephemeral: true });
				}
				await interaction.editReply(`Failed to export CSV file of the product **\`${embedData.title}\`**`);
			}

		}
	},
};