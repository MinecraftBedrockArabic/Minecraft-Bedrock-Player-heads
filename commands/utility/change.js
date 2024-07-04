const { AttachmentBuilder,EmbedBuilder,ActionRowBuilder, ButtonBuilder, ButtonStyle,SlashCommandBuilder} = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const fs = require('node:fs');

const Youtube = new ButtonBuilder().setLabel('Youtube').setStyle(ButtonStyle.Link).setURL('https://www.youtube.com/@MinecraftBedrockArabic');
const Donate = new ButtonBuilder().setLabel('Donate').setStyle(ButtonStyle.Link).setURL('https://paypal.me/mbarabic');
const row = new ActionRowBuilder().addComponents(Youtube,Donate);

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('change')
		.setDMPermission(false)
		.setDescription('Change the skin of a head')
        .addStringOption(option => option.setName('name').setDescription('the name of the head you want to change it skin.').setRequired(true))
		.addAttachmentOption(option => option.setName('skin').setDescription('player skin').setRequired(true)),
	async execute(interaction) {

		const role = interaction.guild.roles.cache.find(role => role.name === "Arabic");
		const hasAr = interaction.member.roles.cache.has(role?.id);
		const folderPath = `./packs/${interaction.user.id}`;
        const name = interaction.options.getString('name');
        const hexName = stringToHex(name);
		const attachment = interaction.options.getAttachment("skin");

		fs.access(folderPath, async (error) => {
			if (error) {
				const noPack = new EmbedBuilder()
					.setColor(0xff8181)
					.setTitle(hasAr?'ليس لديك أي مود.':'You don\'t have an Add-on.')
					.setDescription(hasAr?'ليس لديك أي مود. قم باستعمال:':'You don\'t have an Add-on. use:')
                    .setAuthor({name:interaction.user.username})
					.addFields([{"name":'/create',"value":`${hasAr?'لإنشاء واحد.':'To create one.'}`}]);
				await interaction.reply({embeds: [noPack], components: [row]});
				return
			} else {
                let data = JSON.parse(fs.readFileSync(`./packs/${interaction.user.id}/heads.json`))
                if(!data.heads.includes(name)){
                    const noHead = new EmbedBuilder()
                        .setColor(0xff8181)
                        .setTitle(hasAr?'هذا الرأس غير موجود.':'This head does not exit.')
                        .setDescription(hasAr?'لا يوجد رأس بهذا الاسم.':'there is no head with this name.')
                        .setAuthor({name:interaction.user.username})
                    await interaction.reply({embeds: [noHead], components: [row]});
                    return
                }
				if(attachment.contentType != 'image/png'){
					const notValidSkin = new EmbedBuilder()
						.setColor(0xff8181)
						.setTitle(hasAr?'السكن الذي ارسلته غير صالح':'Not a valid skin')
						.setDescription(hasAr?'يجب ان تكون صورة السكن من نوع:\nPNG':'The skin picture most be of the type:\nPNG');
					await interaction.reply({embeds: [notValidSkin], components: [row]});
					return;
				}
				if(!(((attachment.height == 64|| attachment.height == 32) && attachment.width == 64) || ((attachment.height == 128 || attachment.height == 64) && attachment.width == 128))){
					const notValidSize = new EmbedBuilder()
						.setColor(0xff8181)
						.setTitle(hasAr?'السكن الذي ارسلته غير صالح':'Not a valid skin')
						.setDescription(hasAr?'البوت يدعم فقط السكنات من حجم:\n64 في 64\n128 في 128':'The bot only support those skin sizes:\n64 x 64\n128 x 128');
					await interaction.reply({embeds: [notValidSize], components: [row]});
					return;
				}
				await interaction.deferReply();

				//block and item texture
				const itemPath = `./packs/${interaction.user.id}/player_head_rp/textures/item/head_${hexName}.png`;
				const skinPath = `./packs/${interaction.user.id}/player_head_rp/textures/blocks/head_${hexName}.png`
				const item = await createItem(attachment.url,itemPath,attachment.width);
				await blockTexture(attachment.url,skinPath,attachment.width);
				//block geo
				const blockPath = `./packs/${interaction.user.id}/player_head_bp/blocks/head_${hexName}.json`
				fs.readFile(blockPath, function(err, data) {
					if(err){console.log(err);return};
					let json = JSON.parse(data);
					json["minecraft:block"].components["minecraft:geometry"].identifier = `geometry.${attachment.height==64?'head':'head2'}`
					json = JSON.stringify(json, null);
					fs.writeFile(blockPath, json, function(err) {if(err){console.log(err);return};})
				})

				const attachment1 = new AttachmentBuilder(item,{name: `head_${hexName}.png`});
				const embed = new EmbedBuilder()
					.setColor(0x72ec17)
					.setTitle(hasAr?'تم تغيير سكن رأس.':'The head skin has been changed.')
					.setDescription(hasAr?`تم تفيير سكن الرأس بنجاح.\nالاسم : **${name}**`:`The head skin has been changed successfully.\nName: **${name}**`)
					.setThumbnail(`attachment://head_${hexName}.png`);
					
				await interaction.editReply({embeds: [embed], files: [attachment1],components: [row]});

			}
		});
	}
}

function stringToHex(str) {
    var hex = '';
    for(var i=0;i<str.length;i++) {
        hex += str.charCodeAt(i).toString(16);
    }
    return hex;
}

async function blockTexture(skinURL,texturePath,size) {
	let skinImage = await loadImage(skinURL);
	const canvas = createCanvas(size==128?128:64, size==128?32:16);
	const ctx = canvas.getContext('2d');
	ctx.drawImage(skinImage,0,0)
	const out = fs.createWriteStream(texturePath);
    const stream = canvas.createPNGStream({compressionLevel: 9});
    stream.pipe(out);
    out.on('error', err => console.error('Error processing images:', err));
}

async function createItem(skinURL,itemPath,size) {
	let skinImage = await loadImage(skinURL);
    const itemImage = await loadImage('./assets/item.png');
    const canvas = createCanvas(itemImage.width, itemImage.height);
    const ctx = canvas.getContext('2d');
	if(size == 128){
		const canvas = createCanvas(64, 64);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(skinImage, 0, 0, 64, 64);
		skinImage = canvas;
	}
    const faceLayer = await extractFaceLayer(skinImage,-40, -8); 
    const face = await extractFaceLayer(skinImage,-8, -8);
    ctx.drawImage(itemImage, 0, 0);
    ctx.drawImage(face, 4, 4);
    ctx.drawImage(faceLayer, 4, 4);
    const out = fs.createWriteStream(itemPath);
    const stream = canvas.createPNGStream({compressionLevel: 9});
    stream.pipe(out);
    out.on('error', err => console.error('Error processing images:', err));
	const bigIcon = createCanvas(225, 225);
	const bigCtx = bigIcon.getContext('2d');
	bigCtx.imageSmoothingEnabled = false;
	bigCtx.drawImage(canvas, 0, 0, 225, 225);
	return bigIcon.toBuffer('image/png');
}

async function extractFaceLayer(image,x,y) {
    const canvas = createCanvas(8, 8);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, x,y);
    return canvas;
}