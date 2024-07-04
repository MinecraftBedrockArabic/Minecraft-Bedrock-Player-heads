const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,SlashCommandBuilder ,AttachmentBuilder,userMention} = require('discord.js');
const { createCanvas, loadImage} = require('canvas');
const { v4: uuidv4 } = require('uuid');
const AdmZip = require('adm-zip');
const fs = require('node:fs');

const Youtube = new ButtonBuilder().setLabel('Youtube').setStyle(ButtonStyle.Link).setURL('https://www.youtube.com/@MinecraftBedrockArabic');
const Donate = new ButtonBuilder().setLabel('Donate').setStyle(ButtonStyle.Link).setURL('https://paypal.me/mbarabic');
const row = new ActionRowBuilder().addComponents(Youtube,Donate);

module.exports = {
    cooldown: 20,
    cf9e883400ac4d0383513b2a971ddd2f:'random id to mark this command as specific guild only',
	data: new SlashCommandBuilder()
    .setName('generate_admin')
    .setDMPermission(false)
    .setDescription('Generate another person\'s pack')
    .addSubcommand(subcommand =>
        subcommand.setName('mention')
            .setDescription('Mention the author of the pack')
            .addUserOption(option => option.setName('mention').setDescription('Author of the pack').setRequired(true))
            .addStringOption(option => option.setName('name').setMaxLength(32).setDescription('The name of the pack').setRequired(false))
    )
    .addSubcommand(subcommand =>
        subcommand.setName('id')
            .setDescription('ID of the author of the pack')
            .addStringOption(option => option.setName('id').setDescription('ID of the author of the pack').setRequired(true))
            .addStringOption(option => option.setName('name').setMaxLength(32).setDescription('The name of the pack').setRequired(false))
    ),
    async execute(interaction) {
            const folderPath = `./packs/${interaction.options.getString('id')??interaction.options.getUser('mention').id}`;
            const role = interaction.guild.roles.cache.find(role => role.name === "Arabic");
            const hasAr = interaction.member.roles.cache.has(role?.id);
            let name = interaction.options.getString('name')
            name = name ? `${name}` : `Player Heads`
            const wait = new EmbedBuilder()
            .setColor("Blue")
            .setTitle(hasAr?'الرجاء الانتظار...':'Please wait...')
            .setThumbnail("https://media.discordapp.net/attachments/1225706378673520690/1231214444126933023/head_gif.gif")
            await interaction.reply({embeds: [wait], components: [row]});
            fs.access(folderPath, async (error) => {
                if(error){
                    const noPack = new EmbedBuilder()
                        .setColor(0xff8181)
                        .setTitle(hasAr?'ليس لديك أي مود.':'You don\'t have an Add-on.')
                        .setDescription(hasAr?'ليس لديك أي مود. قم باستعمال:':'You don\'t have an Add-on. use:')
                        .addFields([{"name":'/create',"value":`${hasAr?'لإنشاء واحد.':'To create one.'}`}]);
                    await interaction.editReply({embeds: [noPack], components: [row]});
                    return
                }
                fs.readFile(`${folderPath}/heads.json`,'utf-8', async (err, data) => {
                    if(err){console.log(err);return;}
                    let heads = JSON.parse(data).heads
                    if(heads.length == 0){
                        const noHeads = new EmbedBuilder()
                            .setColor(0xff8181)
                            .setTitle(hasAr?'.لا يوجد أي رأس في المود':'The Add-on don\'t have any heads.')
                            .setDescription(hasAr?'أنت لا تملك أي رؤوس في المود الخاص بك. أستعمل:':'You Don\'t have any heads in your Add-on. use:')
                            .addFields([{name:'/add',value:hasAr?'لإضافة رؤوس للمود.':'To add heads to the Add-on'}]);
                        await interaction.editReply({ embeds: [noHeads] });
                        return;
                    }
                    let headsNumber = heads.length
                    const color = getRandomColor();
                    await packIcon(folderPath, color)
                    const bp_uuid = uuidv4()
                    const rp_uuid = uuidv4()
                    const bp_path = `${folderPath}/player_head_bp/manifest.json`
                    const rp_path = `${folderPath}/player_head_rp/manifest.json`
                    const bp_manifest = {"format_version": 2,"header": {"min_engine_version": [1,20,70],"name": `${name} (BP) `,"description": "By: Minato (Minecraft Bedrock Arabic)","uuid": bp_uuid,"version": [1,0,0]},"modules": [{"type": "data","uuid": "7d348ebc-f9c2-417d-86f0-239ace2deafd","version": [1,0,0]},{"type": "script","language": "javascript","entry": "scripts/index.js","uuid": "85af954c-28ca-454b-a81e-6e64f84d0033","version": [1, 0, 0]}],"dependencies": [{ "uuid": rp_uuid, "version": [1, 0, 0] },{ "module_name": "@minecraft/server", "version": "1.9.0" }]};
                    const rp_manifest = {"format_version": 2,"header": {"min_engine_version": [1,20,70],"name": `${name} (RP)`,"description": "By: Minato (Minecraft Bedrock Arabic)","uuid": rp_uuid,"version": [1,0,0]},"modules": [{"type": "resources","uuid": "655c0cc1-adca-476b-bf18-9de67a379bc8","version": [1,0,0]}],"dependencies": [{"uuid": bp_uuid,"version": [1,0,0]}]}
                    fs.writeFile(bp_path, JSON.stringify(bp_manifest), (err) => {
                        if(err){console.log(err);return;}
                        fs.writeFile(rp_path, JSON.stringify(rp_manifest), async (err) => {
                            if(err){console.log(err);return;}
                            new AdmZip('./assets/finalPack.zip').extractAllTo(`${folderPath}`, true);
                            const zip = new AdmZip();
                            zip.addLocalFolder(folderPath);
                            zip.deleteFile('heads.json');
                            zip.writeZip(`${folderPath}/${headsNumber}_Player_Head.mcaddon`, async (err) => {
                                if(err){console.log(err);return;}
                                
                                let headsNames = ''
                                while (heads[heads.length-1] && headsNames.length <= 150) {
                                    headsNames += `\"${heads[heads.length-1]}\" ,`
                                    heads.pop()
                                }
                                headsNames = headsNames.slice(0,headsNames.length-1)
                                if(heads.length != 0) headsNames += `+[${heads.length} ${hasAr?'أخرى':'More'}]`
    
                                
                                const attachment = new AttachmentBuilder(`${folderPath}/player_head_bp/pack_icon.png`)
                                const done = new EmbedBuilder()
                                    .setColor(color)
                                    .setTitle(hasAr?'.تم تشكيل المود':'The Add-on has been generated.')
                                    .setDescription((hasAr?'المود يتضمن هذه الرؤوس:':'The Add-on includes These heads:') + '\n' + headsNames)
                                    .addFields(
                                        {name:'-------',value:hasAr?`**الاسم:** ${name}\n**عدد الرؤوس**: ${headsNumber}\n**صاحب المود**: ${interaction.user.tag}`: `**Name:** ${name}\n**Number of heads:** ${headsNumber}\n**Owner:** <@${folderPath.replace('./packs/','')}>`},
                                    )
                                    .setThumbnail('attachment://pack_icon.png');
                                
                                
                                const attachment1 = new AttachmentBuilder(`${folderPath}/${headsNumber}_Player_Head.mcaddon`);
                                await interaction.editReply({ content: null ,embeds: [done], files: [attachment1,attachment],components: [row] });
    
                                fs.rm(`${folderPath}/${headsNumber}_Player_Head.mcaddon`,{ recursive: true, force: true }, (err) => {
                                    if(err){console.log(err);return;}
                                    fs.rm(`${folderPath}/player_head_bp/scripts`,{ recursive: true, force: true }, (err) => {
                                        if(err){console.log(err);return;}
                                        fs.rm(`${folderPath}/player_head_bp/pack_icon.png`,{ recursive: true, force: true }, (err) => {
                                            if(err){console.log(err);return;}
                                            fs.rm(`${folderPath}/player_head_rp/pack_icon.png`,{ recursive: true, force: true }, (err) => {
                                                if(err){console.log(err);return;}
                                                fs.rm(`${folderPath}/player_head_rp/models`,{ recursive: true, force: true }, (err) => {
                                                    if(err){console.log(err);return;}
                                                })
                                            })
    
                                        })
                                    })
                                })
                            });
                        })
                    })
                })
            })        
        }
};
    
    
function getRandomColor() {
    let hex = '#';
    const letters = '0123456789ABCDEF';
    for (let i = 0; i < 6; i++) {hex += letters[Math.floor(Math.random() * 16)];}
    return hex;
}

async function packIcon(folderPath,color) {
    const bp_pack_icon = `${folderPath}/player_head_bp/pack_icon.png`
    const rp_pack_icon = `${folderPath}/player_head_rp/pack_icon.png`
    const canvas = createCanvas(225, 225);
    //1% chance of getting the cat icon and 99% chance of getting a random icon out of 7
    const iconIndex = Math.random()<=0.01?8:Math.floor(Math.random() * 8);
     Math.floor(Math.random() * 8)
    await loadImage(`./assets/pack_icon${iconIndex}.png`)
    .then((img) => {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 225, 225);
        return new Promise((resolve, reject) => {
            const out = fs.createWriteStream(bp_pack_icon);
            out.on('error', reject);
            out.on('finish',() => {
                fs.copyFile(bp_pack_icon, rp_pack_icon, (err) => {
                    if (err) throw err;
                    resolve();
                })
            });
            const stream = canvas.createPNGStream();
            stream.pipe(out);
        });
    })
    .catch((err) => {
        console.error('Error generating image:', err);
    });
    return canvas.toBuffer('image/png')
}