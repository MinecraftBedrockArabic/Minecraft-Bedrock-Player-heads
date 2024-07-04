const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,SlashCommandBuilder } = require('discord.js');
const AdmZip = require('adm-zip');
const fs = require('node:fs');

const Youtube = new ButtonBuilder().setLabel('Youtube').setStyle(ButtonStyle.Link).setURL('https://www.youtube.com/@MinecraftBedrockArabic');
const Donate = new ButtonBuilder().setLabel('Donate').setStyle(ButtonStyle.Link).setURL('https://paypal.me/mbarabic');
const row = new ActionRowBuilder().addComponents(Youtube,Donate);

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('create')
		.setDMPermission(false)
		.setDescription('Create an Add-on.'),
	async execute(interaction) {
		const role = interaction.guild.roles.cache.find(role => role.name === "Arabic");
		const hasAr = interaction.member.roles.cache.has(role?.id);

		const folderPath = `./packs/${interaction.user.id}`;
		fs.access(folderPath, async (error) => {
			const packCreate = new EmbedBuilder()
					.addFields([
						{name:'/add',value:`${hasAr? 'اضافة رأس للمود':'Add a head to the Add-on'}`},
						{name:'/remove',value:`${hasAr? 'حذف رأس من المود':'Remove a head from the Add-on'}`},
						{name:'/change',value:`${hasAr? 'تغيير سكن رأس من المود':'change the skin of exiting heads from the Add-on'}`},
						{name:'/generate',value:`${hasAr? 'إنشاء مود الرؤوس.':'Generate the add-on.'}`},
						{name:'/delete',value:`${hasAr? 'حذف المود':'Delete the Add-on'}`},
					]);
			if (error) {
				let zip = new AdmZip("./assets/pack.zip");
				const path = `./packs/${interaction.user.id}`;
				zip.extractAllTo(path, true);
				packCreate.setColor(0x72ec17)
					.setTitle(hasAr?'تم انشاء المود بنجاح':'The Add-on has been created successfully.')
					.setDescription(hasAr?'تم انشاء المود بنجاح.\nيمكنك استعمال الأوامر التالية:':'The Add-on has been created successfully.\nYou can use the following commands:')
			} else {
				packCreate.setColor(0xff8181)
					.setTitle(hasAr?'لديك مود بالفعل':'You already have an Add-on.')
					.setDescription(hasAr?'لديك مود بالفعل. يمكنك استعمال الأوامر التالية:':'You already have an Add-on. You can use the following commands:')
			}
			await interaction.reply({embeds: [packCreate], components: [row]});
		});
	},
};
