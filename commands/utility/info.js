const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,SlashCommandBuilder ,AttachmentBuilder, Attachment} = require('discord.js');
const { createCanvas, loadImage} = require('canvas');
const { v4: uuidv4 } = require('uuid');
const AdmZip = require('adm-zip');
const fs = require('node:fs');


const Youtube = new ButtonBuilder().setLabel('Youtube').setStyle(ButtonStyle.Link).setURL('https://www.youtube.com/@MinecraftBedrockArabic');
const Donate = new ButtonBuilder().setLabel('Donate').setStyle(ButtonStyle.Link).setURL('https://paypal.me/mbarabic');
const row = new ActionRowBuilder().addComponents(Youtube,Donate);

module.exports = {
    cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('info')
        .setDMPermission(false)
		.setDescription('Git some info about your Add-on.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('mention')
                .setDescription('mention the author of the pack')
                .addUserOption(option =>
                    option
                        .setName('author')
                        .setDescription('author of the pack')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('id')
                .setDescription('id of the author of the pack')
                .addStringOption(option =>
                    option
                        .setName('id')
                        .setDescription('id of the author of the pack')
                        .setRequired(true)
                )
        ),
	async execute(interaction) {
        const sub = interaction.options.getSubcommand()
        const id = sub == 'mention' ? interaction.options.getUser('author').id : interaction.options.getString('id');
        
        const folderPath = `./packs/${id}`;
        fs.access(folderPath, async (error) => {
            if(error){
                const noPack = new EmbedBuilder()
                    .setColor(0xff8181)
                    .setTitle("this user don't have an Add-on.")
                    .setDescription("the user you provided don't have an Add-on.")
                await interaction.reply({embeds: [noPack], components: [row]});
                return
            }
            const role = interaction.guild.roles.cache.find(role => role.name === "Arabic");
            const hasAr = interaction.member.roles.cache.has(role?.id);
            
            const stat = fs.statSync(folderPath);
            const headsFile = fs.readFileSync(`./packs/${id}/heads.json`);
            const heads = JSON.parse(headsFile);
            let names = ''
            heads.heads.forEach(head => {
                names += `\"${head}\"; `;
            });
            const info = new EmbedBuilder()
            .setColor("Aqua")
            .setTitle(hasAr?'معلومات المود':'Add-on Info')
            if(heads.heads.length <= 100) {
                info.setDescription(hasAr?
                    `**صاحب المود: ** <@${id}>\n**عدد الرؤوس:** ${heads.heads.length}\n**تاريخ الانشاء:** ${timeStamp(stat.birthtime,hasAr?'ar-Ar':'en-US')}\n**الرؤوس: **\n${names}`:
                    `**Creator: ** <@${id}>\n**Number of heads:** ${heads.heads.length}\n**Creation date:** ${timeStamp(stat.birthtime,hasAr?'ar-Ar':'en-US')}\n**Heads: **\n${names}`
                ),
                await interaction.reply({embeds: [info], components: [row]});
            } else {
                info.setDescription(hasAr?
                    `**صاحب المود: ** <@${id}>\n**عدد الرؤوس:** ${heads.heads.length}\n**تاريخ الانشاء:** ${timeStamp(stat.birthtime,hasAr?'ar-Ar':'en-US')}`:
                    `**Creator: ** <@${id}>\n**Number of heads:** ${heads.heads.length}\n**Creation date:** ${timeStamp(stat.birthtime,hasAr?'ar-Ar':'en-US')}`,
                )
                const attachment = new AttachmentBuilder(Buffer.from(names.replace(/;/g, '\n')), { name: 'heads.txt' });
                await interaction.reply({embeds: [info], files: [attachment], components: [row]});
            }
        });
	}
};


function timeStamp(timestamp,lang) {

    const date = new Date(timestamp);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short' };
    const readableFormat = date.toLocaleString(lang, options);
    return readableFormat;
}