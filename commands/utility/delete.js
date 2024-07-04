const { EmbedBuilder,ComponentType, ActionRowBuilder, ButtonBuilder, ButtonStyle,SlashCommandBuilder} = require('discord.js');
const fs = require('node:fs');

const cancel = new ButtonBuilder().setLabel('cancel').setStyle(ButtonStyle.Primary).setCustomId('cancel');
const Delete = new ButtonBuilder().setLabel('delete').setStyle(ButtonStyle.Danger).setCustomId('delete');
const row = new ActionRowBuilder().addComponents(cancel,Delete);

const Youtube = new ButtonBuilder().setLabel('Youtube').setStyle(ButtonStyle.Link).setURL('https://www.youtube.com/@MinecraftBedrockArabic');
const Donate = new ButtonBuilder().setLabel('Donate').setStyle(ButtonStyle.Link).setURL('https://paypal.me/mbarabic');
const row2 = new ActionRowBuilder().addComponents(Youtube,Donate);

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('delete')
		.setDMPermission(false)
		.setDescription('Delete the Add-on.'),
	async execute(interaction) {
		
		const role = interaction.guild.roles.cache.find(role => role.name === "Arabic");
		const hasAr = interaction.member.roles.cache.has(role?.id);
		const folderPath = `./packs/${interaction.user.id}`;


		fs.access(folderPath, async (error) => {
			if (error) {
				const noPack = new EmbedBuilder()
					.setColor(0xff8181)
					.setAuthor({name:interaction.user.username})
					.setTitle(hasAr?'ليس لديك أي مود.':'You don\'t have an Add-on.')
					.setDescription(hasAr?'ليس لديك أي مود. قم باستعمال:':'You don\'t have an Add-on. use:')
					.addFields([{"name":'/create',"value":`${hasAr?'لإنشاء واحد.':'To create one.'}`}]);
				await interaction.reply({embeds: [noPack], components: [row2]});
				return
			} else {
				const del = new EmbedBuilder()
					.setColor(0xff8181)
					.setTitle(hasAr?'هل أنت متأكد؟':'Are you sure?')
					.setDescription(hasAr?'هل أنت متأكد من حذف المود الخاصة بك؟':'Are you sure you want to delete your Add-on?')
					.setFooter({text:hasAr?'هذا يتضمن كل الرؤوس التي قمت بإضافتها.':'This include all the Heads you added.'})
					.setAuthor({name:interaction.user.username})

				const dlt = await interaction.reply({embeds: [del], components: [row]});
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
						.setAuthor({name:interaction.user.username})
						if(inter.customId == 'cancel'){
							dlt.setColor(0x72ec17)
								.setTitle(hasAr?'تم إلغاء حذف المود.':'Deleting the Add-on has been canceled.')
								.setDescription(hasAr?'لقد قمت بإلغاء حذف المود الخاص بك.':'You have canceled deleting your addon.')
						}
						if(inter.customId == 'delete'){
							const folderPath = `./packs/${interaction.user.id}`;
							fs.rm(folderPath, { recursive: true, force: true }, (error) => {if (error) {console.error('Error while deleting directory.', error)}});
							dlt.setColor(0xff8181)
								.setTitle(hasAr?'تم حذف المود.':'The Add-on has been deleted.')
								.setDescription(hasAr?'لقد قمت بحذف المود الخاص بك.':'You have deleted your Add-on.')
						}
						await inter.update({embeds: [dlt], components: [row2]})
					}
				})
			}

		});
	},
};
