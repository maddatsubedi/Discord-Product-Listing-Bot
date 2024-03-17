const { Events, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder} = require('discord.js');
const csvtojson = require('csvtojson');
const axios = require('axios');

const bot_cmd_channel = '1111894495043260600';
const toChannelID = '1111894441737846794';

let isBotWorking = false;

module.exports = {
        name: Events.MessageCreate,
        async execute(message) {
                const toChannel = await message.client.channels.fetch(toChannelID);
                if (message.author.bot || message.channel.id != bot_cmd_channel) return;
                if (message.attachments.size > 1) {
                        message.reply("Please send one attachment at a time.");
                        return;
                }


                if (message.attachments.size > 0 && message.content != '') {
                        console.log(message.content + ", sent by", message.author.username, "with an Attachment");
                        // console.log(message.attachments.first().attachment);
                } else if (message.attachments.size == 0 && message.content != '') {
                        console.log(message.content + ", sent by", message.author.username);
                        
                } else if (message.attachments.size > 0 && message.content == '') {

                        console.log("An attachment is sent by", message.author.username);
                        // console.log(message.attachments.first().attachment);

                        if (message.attachments.first().attachment.endsWith('.csv')) {

                                // Check if the bot is already working
                                if (isBotWorking) {
                                        message.reply("The bot is already processing a CSV file. Please wait until it finishes.");
                                        return;
                                }

                                // Set the bot to be working
                                isBotWorking = true;

                                const fetchData = async () => {
                                        let jsonContent;
                                        let jsonContentClean = [];
                                        let csvHeaders;
                                        let csvHeadersClean;

                                        try {

                                                const response = await axios.get(message.attachments.first().attachment);
                                                const CSVContent = response.data;

                                                // Extract the headers from the CSV content
                                                const csvRows = CSVContent.split('\n');
                                                if (csvRows.length > 1) {
                                                        csvHeaders = csvRows[0].split(',').map(header => header.trim());
                                                        csvHeadersClean = csvRows[0].split(',').map(header => header.trim()).filter(header => header !== '');
                                                }

                                                // Convert the CSV content to JSON
                                                jsonContent = await csvtojson().fromString(CSVContent);

                                                if (jsonContent.length > 0) {

                                                        const jsonContentFull = [csvHeaders, ...jsonContent]; // Combine headers with the jsonContent array

                                                        for (let i = 1; i < jsonContentFull.length; i++) {
                                                                let filteredItems = {};
                                                                for (let j = 0; j < jsonContentFull[0].length; j++) {
                                                                        if (!jsonContentFull[0][j]) {
                                                                                continue;
                                                                        } else if (!jsonContentFull[i][jsonContentFull[0][j]]) {
                                                                                filteredItems[jsonContentFull[0][j]] = jsonContentFull[0][j];
                                                                                continue;
                                                                        }
                                                                        filteredItems[jsonContentFull[0][j]] = jsonContentFull[i][jsonContentFull[0][j]];
                                                                        // console.log(jsonContentFull[0][j], ':', jsonContentFull[i][jsonContentFull[0][j]]);
                                                                }
                                                                if (Object.keys(filteredItems).length === 0) {
                                                                        continue;
                                                                }
                                                                jsonContentClean.push(filteredItems);
                                                        }

                                                }

                                                const jsonContentFull = [csvHeaders, ...jsonContent];
                                                const jsonContentCleanFull = [csvHeadersClean, ...jsonContentClean];

                                                return { jsonContent, jsonContentFull, jsonContentClean, jsonContentCleanFull, csvHeaders, csvHeadersClean };

                                        } catch (error) {
                                                if (error.response) {
                                                        console.error('Error reading remote file:', error);
                                                } else {
                                                        console.error('Error fetching CSV:', error);
                                                }
                                                return null;
                                        }
                                };

                                (async () => {
                                        const { jsonContent, jsonContentFull, jsonContentClean, jsonContentCleanFull, csvHeaders, csvHeadersClean } = await fetchData();


                                        // console.log(jsonContentCleanFull, jsonContentCleanFull.length);

                                        if (jsonContentClean.length > 0) {

                                                const prepostSsnInfoEmbed = new EmbedBuilder()
                                                        .setTitle('Posts Session Info')
                                                        .setColor(0xFFA500)
                                                        .setDescription(`Posting ${jsonContentClean.length} products in ${toChannel} `)
                                                        .setTimestamp();
                                                message.channel.send({ embeds: [prepostSsnInfoEmbed] });

                                                let postCount = 0;

                                                for (let i = 1; i < jsonContentCleanFull.length; i++) {

                                                        try {
                                                                // 0, 1, 2, 2, 3, 4, 5, 6, 7, 8

                                                                const itemButton = new ButtonBuilder()
                                                                        .setLabel('Visit Product')
                                                                        .setURL(jsonContentCleanFull[i]['product_url'])
                                                                        .setStyle(ButtonStyle.Link);
                                                                const storeButton = new ButtonBuilder()
                                                                        .setLabel('Visit Store')
                                                                        .setURL(jsonContentCleanFull[i]['store_url'])
                                                                        .setStyle(ButtonStyle.Link);
                                                                const csvButton = new ButtonBuilder()
                                                                        .setLabel('Export CSV')
                                                                        .setCustomId(`Export Product`)
                                                                        .setStyle(ButtonStyle.Primary);
                                                                const embedbuttonRow = new ActionRowBuilder()
                                                                        .addComponents(itemButton, storeButton, csvButton);

                                                                const productEmbed = new EmbedBuilder()
                                                                        .setColor(0x0099FF)
                                                                        .setTitle(`${jsonContentCleanFull[i]['keyword']}`)
                                                                        .setURL(jsonContentCleanFull[i]['product_url'])
                                                                        .setAuthor({ name: 'Author Name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
                                                                        .setDescription(`${jsonContentCleanFull[i]['product_description']}`, 'lgksfdjg`lkf\`')
                                                                        // .setThumbnail('https://i.imgur.com/AfFp7pu.png')
                                                                        .addFields(
                                                                                { name: `> **\`price\`**`, value: `> ${jsonContentCleanFull[i]['price']}`, inline: true },
                                                                                { name: `> **\`ratings\`**`, value: `> ${jsonContentCleanFull[i]['ratings']}`, inline: true },
                                                                                { name: `> **\`sales_amount\`**`, value: `> ${jsonContentCleanFull[i]['sales_amount']}`, inline: true },
                                                                                { name: `> **\`store_name\`**`, value: `> ${jsonContentCleanFull[i]['store_name']}`, inline: true },
                                                                        )
                                                                        .setImage(jsonContentCleanFull[i]['image_url'])
                                                                        .setTimestamp()
                                                                        .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
                                                                await toChannel.send({ embeds: [productEmbed], components: [embedbuttonRow] });
                                                                postCount += 1;
                                                        } catch (error) {
                                                                // postCount -= 1;
                                                                console.log(error);
                                                        }

                                                }
                                                const postSsnInfoEmbed = new EmbedBuilder()
                                                        .setTitle('Posts Session Info')
                                                        .setColor(0x00FF00)
                                                        .setDescription(`${postCount} Posts sent out of ${jsonContentClean.length} Products`)
                                                        .setTimestamp();
                                                message.channel.send({ embeds: [postSsnInfoEmbed] });
                                                console.log(postCount, "Posts sent out of", jsonContentClean.length, "Products");


                                        } else {
                                                console.log("Please send a valid CSV file.");
                                                await message.reply("Please send a valid CSV file.");
                                        }

                                        isBotWorking = false;
                                })();
                        } else {
                                message.reply("Please send a CSV file.");
                        }
                }

                // toChannel.send(message.attachments.first().attachment);

        },
};