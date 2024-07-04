const { AttachmentBuilder,EmbedBuilder,ComponentType, ActionRowBuilder, ButtonBuilder, ButtonStyle,SlashCommandBuilder} = require('discord.js');
const { createCanvas, loadImage} = require('canvas');
const fs = require('node:fs');

const cancel = new ButtonBuilder().setLabel('cancel').setStyle(ButtonStyle.Primary).setCustomId('cancel');
const Delete = new ButtonBuilder().setLabel('remove').setStyle(ButtonStyle.Danger).setCustomId('remove');
const row = new ActionRowBuilder().addComponents(cancel,Delete);

const Youtube = new ButtonBuilder().setLabel('Youtube').setStyle(ButtonStyle.Link).setURL('https://www.youtube.com/@MinecraftBedrockArabic');
const Donate = new ButtonBuilder().setLabel('Donate').setStyle(ButtonStyle.Link).setURL('https://paypal.me/mbarabic');
const row2 = new ActionRowBuilder().addComponents(Youtube,Donate);

module.exports = {
    cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDMPermission(false)
		.setDescription('Remove a player head.')
        .addStringOption(option => option.setName('name').setDescription('the name of the head to remove.').setRequired(true)),
	async execute(interaction) {
		
		const role = interaction.guild.roles.cache.find(role => role.name === "Arabic");
		const hasAr = interaction.member.roles.cache.has(role?.id);
		const folderPath = `./packs/${interaction.user.id}`;
        const name = interaction.options.getString('name');
        const hexName = stringToHex(name);

		fs.access(folderPath, async (error) => {
			if (error) {
				const noPack = new EmbedBuilder()
					.setColor(0xff8181)
					.setTitle(hasAr?'ليس لديك أي مود.':'You don\'t have an Add-on.')
					.setDescription(hasAr?'ليس لديك أي مود. قم باستعمال:':'You don\'t have an Add-on. use:')
                    .setAuthor({name:interaction.user.username})
					.addFields([{"name":'/create',"value":`${hasAr?'لإنشاء واحد.':'To create one.'}`}]);
				await interaction.reply({embeds: [noPack], components: [row2]});
				return
			} else {
                let data = JSON.parse(fs.readFileSync(`./packs/${interaction.user.id}/heads.json`))
                if(!data.heads.includes(name)){
                    const noHead = new EmbedBuilder()
                        .setColor(0xff8181)
                        .setTitle(hasAr?'هذا الرأس غير موجود.':'This head does not exit.')
                        .setDescription(hasAr?'لا يوجد رأس بهذا الاسم.':'there is no head with this name.')
                        .setAuthor({name:interaction.user.username})
                    await interaction.reply({embeds: [noHead], components: [row2]});
                    return
                }
                const icon = await createItem(interaction.user.id,hexName)
                const attachment = new AttachmentBuilder(icon, {name: `head_${hexName}.png`});
				const del = new EmbedBuilder()
					.setColor(0xff8181)
					.setTitle(hasAr?'هل أنت متأكد؟':'Are you sure?')
					.setDescription(hasAr?`هل أنت متأكد من حذف هذا الرأس؟\nالاسم: ${name}`:`Are you sure you want to remove this head?\nName: ${name}`)
                    .setThumbnail(`attachment://head_${hexName}.png`)
                    .setAuthor({name:interaction.user.username})

				const dlt = await interaction.reply({embeds: [del], components: [row],files: [attachment]});
				const collect = dlt.createMessageComponentCollector({componentType: ComponentType.Button,time: 50000,})

                collect.on('collect', async inter => {
					if(inter.user.id != interaction.user.id){
						const only_user = new EmbedBuilder()
							.setColor(0xff8181)
							.setTitle(hasAr?'لا يمكنك حدف هذه المود.':'You can\'t delete this Add-on.')
							.setDescription(hasAr?'لا يمكنك حذف مود لا يخصك.':'You can\'t delete an Add-on you don\'t own.')

						await inter.update({ephemeral: true,embeds: [only_user], components: [row2]});
					}else{
						const dlt = new EmbedBuilder() 
                            .setThumbnail(`attachment://head_${hexName}.png`)
                            .setAuthor({name:interaction.user.username})
						if(inter.customId == 'cancel'){
							dlt.setColor(0x72ec17)
								.setTitle(hasAr?'تم إلغاء حذف الرأس.':'Deleting the head has been canceled.')
								.setDescription(hasAr?'تم الإلغاء بنجاح.':'successfully canceled.')
						}
						if(inter.customId == 'remove'){
							dlt.setColor(0xff8181)
								.setTitle(hasAr?'تم حذف الرأس.':'this head has been removed.')
								.setDescription(hasAr?`لقد قمت بحذف هذا الرأس.\nالاسم: ${name}`:`You have deleted this head.\nName: ${name}`);

                            //remove the head from the list
                            data.heads = data.heads.filter(head => head !== name);
                            data = JSON.stringify(data);
                            fs.writeFile(`./packs/${interaction.user.id}/heads.json`,data, function(err) {if(err){console.log(err);return};})

                            fs.rm( `./packs/${interaction.user.id}/player_head_rp/textures/item/head_${hexName}.png`, function(err) {if(err){console.log(err);return};})
                            fs.rm(`./packs/${interaction.user.id}/player_head_rp/textures/blocks/head_${hexName}.png`, function(err) {if(err){console.log(err);return};})
                            fs.rm(`./packs/${interaction.user.id}/player_head_bp/blocks/head_${hexName}.json`, function(err) {if(err){console.log(err);return};})
                            fs.rm(`./packs/${interaction.user.id}/player_head_bp/items/head_${hexName}.json`, function(err) {if(err){console.log(err);return};})
                            fs.rm(`./packs/${interaction.user.id}/player_head_bp/loot_tables/blocks/head_${hexName}.json`, function(err) {if(err){console.log(err);return};})
                            fs.rm(`./packs/${interaction.user.id}/player_head_rp/attachables/item.head_${hexName}.json`, function(err) {if(err){console.log(err);return};})
                            

                            fs.readFile(`./packs/${interaction.user.id}/player_head_rp/texts/en_US.lang`, function(err, data) {
                                if(err){console.log(err);return};
                                let names = data.toString();
                                let lines = names.split('\n');
                                lines = lines.filter(line => !line.includes(`tile.mba:head_${hexName}.name=${name}'s head`) && !line.includes(`item.mba:item_head_${hexName}=${name}'s head`));
                                names = lines.join('\n');
                                fs.writeFile(`./packs/${interaction.user.id}/player_head_rp/texts/en_US.lang`,names, function(err) {if(err){console.log(err);return};})
                            })
                            fs.readFile(`./packs/${interaction.user.id}/player_head_rp/textures/terrain_texture.json`, function(err, data) {
                                if(err){console.log(err);return};
                                let json = JSON.parse(data);
                                delete json.texture_data[`head_${hexName}`]
                                json = JSON.stringify(json, null);
                                fs.writeFile(`./packs/${interaction.user.id}/player_head_rp/textures/terrain_texture.json`, json, function(err) {if(err){console.log(err);return};})
                            })
                            fs.readFile(`./packs/${interaction.user.id}/player_head_rp/textures/item_texture.json`, function(err, data) {
                                if(err){console.log(err);return};
                                let json = JSON.parse(data);
                                delete json.texture_data[`head_${hexName}`]
                                json = JSON.stringify(json, null);
                                fs.writeFile(`./packs/${interaction.user.id}/player_head_rp/textures/item_texture.json`, json, function(err) {if(err){console.log(err);return};})
                            })
						}
						await inter.update({embeds: [dlt], components: [row2],files: [attachment]})
					}
				})
			}
		});
	},
};

function stringToHex(str) {
    var hex = '';
    for(var i=0;i<str.length;i++) {
        hex += str.charCodeAt(i).toString(16);
    }
    return hex;
}

async function createItem(id,hexName) {
    const itemImage = await loadImage(`./packs/${id}/player_head_rp/textures/item/head_${hexName}.png`);
	const bigIcon = createCanvas(225, 225);
	const bigCtx = bigIcon.getContext('2d');
	bigCtx.imageSmoothingEnabled = false;
	bigCtx.drawImage(itemImage, 0, 0, 225, 225);
	return bigIcon.toBuffer('image/png');
}