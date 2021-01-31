require('dotenv').config()
require('events').defaultMaxListeners = 20;
const Discord = require('discord.js')
const client = new Discord.Client({
    partials: ["MESSAGE", "CHANNEL", "REACTION"]
})
const moment = require('moment')
const config = require('./config.json')
const prefix = config.prefix
const bottoken = config.bottoken
const ytdl = require('ytdl-core')
const queue = new Map()
const api = config.api
const YouTube = require('simple-youtube-api')
const youtube = new YouTube(api)
const { CHANNEL, SERVER, LIVE } = require("./config.json");
const YoutubeNotifier = require('youtube-notification')
const notifier = new YoutubeNotifier({
  hubCallback: 'http://hastagbot.c1.biz/',
  secret: 'JOIN_MY_SERVER',
})
const channelId = config.channelid
const serverChannelId = config.serverchid
const idsjson = require('./channelIds.json')
const reactionEmbed = require('./reaction-embed')
const DisTube = require('distube');
const distube = new DisTube(client, { searchSongs: true, emitNewSongOnly: true, highWaterMark: 1 << 25 });
const embed = (title, desc) => new Discord.MessageEmbed().setTitle(title).setDescription(desc).setColor(config.dcEmbed.color);

client.login(bottoken)

client.on('ready',  () => {
    console.log('Hashtagbot is successfully gone online! :)')
    setInterval(() => {
        const statuses = [
            '?help',
            'Fejlesztő: KimaDev',
            'Youtube: Kima Gamer ツ',
            client.guilds.cache.size + ' ' + 'szerver'
        ]
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        if(status == '?help') {
            client.user.setActivity(status, {type: 'WATCHING'})
        } else if(status == 'Fejlesztő: KimaDev'){
            client.user.setActivity(status, {type: 'PLAYING'})
        } else if(status == 'Youtube: Kima Gamer ツ'){
            client.user.setActivity(status, {type: 'WATCHING'})
        } else if(status == client.guilds.cache.size + ' ' + 'szerver'){
            client.user.setActivity(status, {type: 'PLAYING'})
        }
    }, 5000)
})

notifier.subscribe(config.chid);

notifier.on('notified', data => {
  console.log('Video Posted Successfully')
  client.channels.cache.get(serverChannelId).send(
    `**${data.channel.name}** feltöltött egy új videót vagy éppen streamel: ${data.video.link}`
  )
})

/*client.on('message', async message => {
    if(message.author.bot) return
    if(!message.content.startsWith(prefix)) return
    if(message.content.startsWith(`${prefix}radio`)) {
        playRadio();
    }
})

function playRadio() {
    let channel = client.channels.cache.get(CHANNEL) || await client.channels.fetch(CHANNEL)
  
    if(!channel) return;
    const connection = await channel.join();
    connection.play(ytdl(LIVE))
    const embed = new Discord.MessageEmbed()
            .setColor('#00A2A2')
            .addField('📻','Rádió Elindítva!')
            .setTimestamp()
        message.channel.send(embed)
  }

  setInterval(async function() {
    if(!client.voice.connections.get(SERVER)) {
      let channel = client.channels.cache.get(CHANNEL) || await client.channels.fetch(CHANNEL)
      if(!channel) return;
  
      const connection = await channel.join()
      connection.play(ytdl(LIVE))
    }
}, 20000)*/

client.on('message', async message => {
    if(!message.content.startsWith(prefix)) return
    if(message.content.startsWith(`${prefix}help`)) {
        try {
            const embed = new Discord.MessageEmbed()
                .setColor('#00A2A2')
                .setTitle('🆘 #Bot Segítség')
                .setFooter('Segítség a HastagBot Használatához')
                .addField('Support szerver','https://discord.gg/K8SAM3rtEh')
                .addField('Bot parancsok','Írd be az alábbi parancsot: ?command')
                .setTimestamp()
            message.channel.send(embed)
        } catch(err) {
            const embed = new Discord.MessageEmbed()
                .setColor('#CB4335')
                .setTitle('❌ Hiba!')
                .setFooter('Hashtagbot')
                .addField(err,'')
                .setTimestamp()
            message.channel.send(embed)
        }
    }
})

client.on('message', async message => {
    if(!message.content.startsWith(prefix)) return
    if(message.content.startsWith(`${prefix}hi`)) {
        welcome
    }
})

client.on('message', async message => {
    if(!message.content.startsWith(prefix)) return
    if(message.content.startsWith(`${prefix}serverinfo`)) {
        try {
            const { guild } = message;
		    const { name, region, memberCount, owner, afkTimeout, roles, emojis, createdAt, maximumMembers } = guild;
		    const icon = guild.iconURL();
		    const embed = new Discord.MessageEmbed()
            .setTitle(`🆔 Szerver Információ`)
            .setColor('#00A2A2')
			.setThumbnail(icon)
			.addFields(
				{
					name: 'Készítette:',
					value: owner,
					inline: true,
				},
				{
					name: 'Létrehozva:',
					value: createdAt,
					inline: true,
                },
                {
					name: 'Név:',
					value: name,
					inline: true,
                },
                {
					name: 'Tagok száma:',
					value: memberCount,
					inline: true,
                },
                {
					name: 'Maximális tagszám:',
					value: maximumMembers,
					inline: true,
                },
                {
					name: 'AFK időkorlát(másodperc):',
					value: afkTimeout,
					inline: true,
                },
                {
					name: 'Rangok száma:',
					value: roles.cache.size,
					inline: true,
                },
                {
					name: 'Emojik száma:',
					value: emojis.cache.size,
					inline: true,
                },
                {
					name: 'Szerver régió:',
					value: region,
					inline: true,
                },
            );
		    message.channel.send(embed);
        } catch(err) {
            const embed = new Discord.MessageEmbed()
                .setColor('#CB4335')
                .setTitle('❌ Hiba!')
                .setFooter('Hashtagbot')
                .addField(err,'')
                .setTimestamp()
            message.channel.send(embed)
        }
    }
})

client.on('message', async message => {
    if(!message.content.startsWith(prefix)) return
    if(message.content.startsWith(`${prefix}pfp`)) {
        try {
            let member = message.mentions.members.first() || message.member;
            const {  user } = member;
            const embed = new Discord.MessageEmbed()
                .setColor('#00A2A2')
                .setTitle(`${member.user.username} profilképe`)
                .addField('Eredeti Megnyitása', "[Kattints Ide](" + member.user.avatarURL(Boolean) + ")")
                .setImage(member.user.displayAvatarURL())
                .setTimestamp()
            message.channel.send(embed)
        } catch(err) {
            const embed = new Discord.MessageEmbed()
                .setColor('#CB4335')
                .setTitle('❌ Hiba!')
                .setFooter('Hashtagbot')
                .addField('Hibakód:',err)
                .setTimestamp()
            message.channel.send(embed)
        }
    }
})

client.on('message', async message => {
    if(!message.content.startsWith(prefix)) return
    if(message.content.startsWith(`${prefix}userinfo`)) {
        try {
            let member = message.mentions.members.first() || message.member;
        const { id, roles, joinedAt, lastMessage, permissions, nickname, premiumSince, displayName, presence, user } = member;
        var nickvalue = "Nincs";
        var nitrovalue = "Nincs";
        if(nickname == null) {
            nickvalue = "Nincs";
        } else {
            nickvalue = nickname;
        }
        if(premiumSince == null) {
            nitrovalue = "Nincs";
        } else {
            nitrovalue = "Van";
        }
        if (member.presence.status === 'dnd') member.presence.status = 'Ne zavarjanak';
        if (member.presence.status === 'online') member.presence.status = 'Elérhető';
        if (member.presence.status === 'idle') member.presence.status = 'Távol a géptől';
        if (member.presence.status === 'offline') member.presence.status = 'Nem elérhető';
		const embed = new Discord.MessageEmbed()
            .setTitle(`🆔 Felhasználó Információ`)
            .setColor('#00A2A2')
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp()
			.addFields(
                {
					name: 'Felhasználónév:',
					value: displayName,
					inline: true,
                },
				{
					name: 'Felhasználó ID:',
					value: id,
					inline: true,
                },
                {
					name: 'Discordon regisztrált:',
					value: user.createdAt,
					inline: true,
                },
                {
					name: 'Szerverhez csatlakozott:',
					value: joinedAt,
					inline: true,
                },
				{
					name: 'Legmagasabb rangja:',
					value: roles.highest.toString(),
					inline: true,
                },
                {
					name: 'Rangjai:',
					value: `<@&${member._roles.join('> <@&')}>`,
					inline: true,
                },
                {
					name: 'Jogai:',
                    value: permissions.toJSON(),
					inline: true,
                },
                {
					name: 'Utolsó üzenet:',
					value: lastMessage,
					inline: true,
                },
                {
					name: 'Beceneve:',
					value: nickvalue,
					inline: true,
                },
                {
					name: 'Van nitrója:',
					value: nitrovalue,
					inline: true,
                },
                {
					name: 'Állapota:',
					value: presence.status,
					inline: true,
                },
            );
		message.channel.send(embed);
        } catch(err) {
            const embed = new Discord.MessageEmbed()
                .setColor('#CB4335')
                .setTitle('❌ Hiba!')
                .setFooter('Hashtagbot')
                .addField('Hibaüzenet:',err)
                .setTimestamp()
            message.channel.send(embed)
        }
    }
})

client.on('message', async message => {
    if(!message.content.startsWith(prefix)) return
    if(message.content.startsWith(`${prefix}szia`)) {
        welcome
    }
})

client.on('message', async message => {
    if(!message.content.startsWith(prefix)) return
    if(message.content.startsWith(`${prefix}hello`)) {
        welcome
    }
})

function welcome() {
    message.channel.send(`Szia ${message.author}!`)
}

client.on('message', async message => {
    if(!message.content.startsWith(prefix)) return
    if(message.content.startsWith(`${prefix}command`)) {
        try {
            const embed = new Discord.MessageEmbed()
            .setColor('#00A2A2')
            .setTitle('🔧 #Bot Parancsok')
            .setFooter('Segítség a HastagBot Parancsaihoz')
            .addField('?help','Segítség a bot használatához')
            .addField('?inf','Információ a botról')
        	.addField('?music','HastagBot zene parancsok')
            .addField('?net','Internet sebesség tesztelése')
            .addField('?flip','Fej vagy Írás')
            .addField('?hi, ?szia, ?hello','Köszönés a botnak')
            .addField('??','?')
            .addField('?ping','Ping-Pong a bottal')
            .addField('?kima','A bot fejlesztőjének(KimaDev) megemlítése')
            .addField('?join','Üdvözlő csatorna létrehozása a szerverhez csatlakozó embereknek')
            .addField('?porn','Pornó videó nézése')
            .addField('?serverinfo','Információ az adott szerverről')
            .addField('?userinfo <említés>','Információ az általad választott felhasználóról')
            .addField('?pfp <említés>','Az általad választott felhasználó profilképe')
            .setTimestamp()
            message.channel.send(embed)
        } catch(err) {
            const embed = new Discord.MessageEmbed()
                .setColor('#CB4335')
                .setTitle('❌ Hiba!')
                .setFooter('Hashtagbot')
                .addField(err,'')
                .setTimestamp()
            message.channel.send(embed)
        }
    }
})

client.on('message', async message => {
    if(!message.content.startsWith(prefix)) return
    if(message.content.startsWith(`${prefix}ping`)) {
        message.channel.send(`Pong, ${message.author}`)
    }
})

client.on('message', async message => {
    if(!message.content.startsWith(prefix)) return
    if(message.content.startsWith(`${prefix}kima`)) {
        message.channel.send(`<@654721418273226793>`)
    }
})

client.on('message', async message => {
    if(!message.content.startsWith(prefix)) return
    if(message.content.startsWith(`${prefix}?`)) {
        message.author.send(`?`)
    }
})

client.on('message', async message => {
    if(!message.content.startsWith(prefix)) return
    if(message.content.startsWith(`${prefix}porn`)) {
        
        message.channel.send(`Komolyan elhitted? 😂`)
    }
})

client.on('message', async message => {
    if(!message.content.startsWith(prefix)) return
    if(message.content.startsWith(`${prefix}inf`)) {
        try {
            const embed = new Discord.MessageEmbed()
            .setColor('#00A2A2')
            .setTitle('❓ Információ a #Bot-ról')
            .setFooter('HashtagBot')
            .addField('Fejlesztő','KimaDev')
            .addField('Prefix','?')
        	.addField('Segítség parancs','?help')
            .addField('Verzió','v3.0.1')
            .addField('Weboldal','http://hastagbot.c1.biz')
            .setTimestamp()
            message.channel.send(embed)
        } catch(err) {
            const embed = new Discord.MessageEmbed()
                .setColor('#CB4335')
                .setTitle('❌ Hiba!')
                .setFooter('Hashtagbot')
                .addField(err,'')
                .setTimestamp()
            message.channel.send(embed)
        }
    }
})

client.on('message', async message => {
    if(!message.content.startsWith(prefix)) return
    if(message.content.startsWith(`${prefix}net`)) {
        try {
            const embed = new Discord.MessageEmbed()
            .setColor('#00A2A2')
            .setTitle('⏱ Internet sebesség tesztelése')
            .setFooter('Kattints a linkre, majd a GO gombra!')
            .addField('SpeedTest.net','https://speedtest.net')
            .setTimestamp()
            message.channel.send(embed)
        } catch(err) {
            const embed = new Discord.MessageEmbed()
                .setColor('#CB4335')
                .setTitle('❌ Hiba!')
                .setFooter('Hashtagbot')
                .addField(err,'')
                .setTimestamp()
            message.channel.send(embed)
        }
    }
})

client.on('message', async message => {
    if(!message.content.startsWith(prefix)) return
    if(message.content.startsWith(`${prefix}music`)) {
        try {
            const embed = new Discord.MessageEmbed()
                .setColor('#00A2A2')
                .setTitle('🎶 #Bot Zene Parancsok')
                .setFooter('A HashtagBot zenelejátszó bot parancsai')
                .addField('?play <zenecím/előadó>','Kívánt zene lejátszása YouTube-ról')
                .addField('?stop','Éppen játszott zene leállítása')
                .addField('?queue','Lejátszási lista megtekintése')
                .addField('?skip','Lapozás a következő zeneszámra a lejátszási listán')
                .addField('?now','Információ az éppen játszott zenéről')
                .setTimestamp()
            message.channel.send(embed)
        } catch(err) {
            const embed = new Discord.MessageEmbed()
                .setColor('#CB4335')
                .setTitle('❌ Hiba!')
                .setFooter('Hashtagbot')
                .addField(err,'')
                .setTimestamp()
            message.channel.send(embed)
        }
    }
})

client.on('message', async message => {
    var flip_result = "❌ Hiba!"
    var res_number = Math.random()
    if(res_number > 0.5){
        flip_result = "Fej"
    } else if(res_number < 0.5){
        flip_result = "Írás"
    }

    if(!message.content.startsWith(prefix)) return
    if(message.content.startsWith(`${prefix}flip`)) {
        const embed = new Discord.MessageEmbed()
            .setColor('#00A2A2')
            .setTitle('🍀 Érme Feldobás')
            .addField('Eredmény',`${flip_result}`)
            .setTimestamp()
        message.channel.send(embed)
    }
})

client.on('message', async message => {
    if(!message.content.startsWith(prefix)) return
    if(message.content.startsWith(`${prefix}join`)) {
        try {
            message.guild.channels.create('üdvözlő', {
                type: 'text'
            })
            message.channel.send(`✅ Csatorna sikeresen létrehozva!`)
        } catch(err) {
            const embed = new Discord.MessageEmbed()
                .setColor('#CB4335')
                .setTitle('❌ Hiba!')
                .setFooter('Hashtagbot')
                .addField(err,'')
                .setTimestamp()
            message.channel.send(embed)
        }
    }
})

client.on('message', async message => {
    if(!message.content.startsWith(prefix)) return
    if(message.content.startsWith(`${prefix}hashtag`)) {
        try {
            message.author.send(`A fejlesztőm **(Yolo_KimaGamer#9111)** nevében is gratulálok <@${message.author.id}>! Megtaláltad az Easter Egget amit elrejtett bennem! Kattints ide a jutalmadért: http://hastagbot.c1.biz/redeem.html és írd be ezt a kódot: **69Z8-7AIU-45K2**`)
        } catch {
            console.log(`${message.author} found the easter egg, but not get messages from server members!`)
        }
    }
})

client.on("message", async message => {
    if(message.content.startsWith(`${prefix}rules`)) {
        const embed = new Discord.MessageEmbed()
            .setTitle('Szabályzat')
            .setColor('#00A2A2')
            .addField(':one:', 'Ne káromkodj a szerveren!')
            .addField(':two:', 'Ne csúfolj, szidj és közösíts ki másokat!')
            .addField(':three:', 'Ne provokálj másokat!')
            .addField(':four:', 'Ne küldj 18+ tartalmú képeket/linkeket!')
            .addField(':five:', 'Trágár felhasználónév és státusz használata tiltott!')
            .addField(':six:', 'Ne használj "Multi Acoount"-ot!')
            .addField(':seven:', 'Ne írj csak "CAPS LOCK"-al!')
            .addField(':eight:', 'Ne vidd túlzásba az emojik használatát!')
            .addField(':nine:', 'Ne hirdess más Discord szervereket!')
            .addField(':one::zero:', 'Ne promózd magad, másokat, csak ha YouTuber vagy Twitcher rangod van és csak az #🤩-önpromó  csatornába!')
            .addField(':x:', 'A szabályok megszegése esetén warnolunk, ha 3 szor szeged meg a szabályokat banolunk a szerverről!')
            .addField('✅', 'Ha elolvastad és elfogadod a szabályzatot reagálj erre az üzenetre ✅ emojival! ')
            .addField(':slight_smile:', 'Kellemes időtöltést a szerveren!')
            .setDescription('Kérlek figyelmesen olvasd el és tartsd be a szabályokat!')
            .setTimestamp()
        const msg = await message.channel.send(embed)
        msg.react('✅')
    }
})

client.on('raw', event => {
    const eventName = event.t
    if(eventName === 'MESSAGE_REACTION_ADD') {
        if(event.d.message_id === '785110575789244437') {
            var reactionChannel = client.channels.get(event.d.channel.id)
            if(reactionChannel.message.has(event.d.message_id)) return
            reactionChannel.fetchMessage(event.d.message_id)
            .then(msg => {
                var msgReaction = msg.reactions.get(event.d.emoji.name + ':' + event.d.emoji.id)
                var user = client.users.get(event.d.user_id)
                client.emit('messageReactionAdd', msgReaction, user)
            })
            .catch(err => console.log(err))
        }
    }
})

client.on('messageReactionAdd', (messageReaction, user) => {
    var roleId = '784153764428382218'
    var channelId = '784145818239762443'
    if(messageReaction.message.channel.id == channelId) {
        var member = messageReaction.message.guild.member(user.id)
        if(member) {
            member.roles.add(roleId)
            console.log('Somebody accepted the rules successfully!')
        }
    }
})

client.on('messageReactionRemove', (messageReaction, user) => {
    var roleId = '784153764428382218'
    var channelId = '784145818239762443'
    if(messageReaction.message.channel.id == channelId) {
        var member = messageReaction.message.guild.member(user.id)
        if(member) {
            member.roles.remove(roleId)
            console.log('Somebody removed his/her reaction!')
        }
    }
})

//musicplayinggggggggg

client.on("message", async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase()

    if (command == "play")
        distube.play(message, args.join(" "));
    if (command == "stop") {
        distube.stop(message);
        message.channel.send(embed("⏹ A zene leállítva!", "").setTimestamp());
    }
    if (command == "queue") {
        let queue = distube.getQueue(message);
        message.channel.send(
            embed("Lejátszási lista:", queue.songs.map((song, id) =>
            `${id + 1}. ${song.name}`).join("\n").setTimestamp())
        );
    }
    if(command == "skip") {
        try {
            distube.skip(message)
            message.channel.send(embed("⏭ A zene átugorva!", "").setTimestamp());
        } catch (error) {
            message.channel.send(embed("⏯ Vége a lejátszási listának!", "").setTimestamp())
        }
    }
});

const status = (queue) => [
    { name: `Hangerő`, value: `${queue.volume}/100`},
    { name: `Automatikus Lejátszás`, value: `${queue.autoplay ? "Igen" : "Nem"}`}
];

distube
    .on("playSong", (message, queue, song) => message.channel.send(
        embed("▶ Éppen Játszott: " + song.name, "")
        .addField('Zenét Indította', song.user, )
        .addField('Időtartam', song.formattedDuration, )
        .addFields(status(queue))
        .setTimestamp()
    ))
    .on("addSong", (message, queue, song) => message.channel.send(
        embed(`**${song.name}** hozzáadva a lejátszási listához!`).addField("Listához Hozzáadta", song.user).addField("Időtartam", song.formattedDuration).setTimestamp()
    ))
    .on("playList", (message, queue, playlist, song) => message.channel.send(
        embed("▶ Lejátszási Lista: " + playlist.title, "")
        .addField('Tartalma', playlist.total_items + 'zeneszám')
        .addField("Éppen Játszott Zene", song.name)
        .addField('Éppen Játszott Zene Időtartama', song.formattedDuration, )
        .addField('A Számot a Listához Adta', song.user, )
        .addFields(status(queue))
        .setTimestamp()
    ))
    .on("addList", (message, queue, playlist) => message.channel.send(
        embed("▶ Lejátszási Lista: " + playlist.title, "")
        .addField('Tartalma', playlist.total_items + 'zeneszám')
        .addField("Éppen Játszott Zene", song.name)
        .addField('Éppen Játszott Zene Időtartama', song.formattedDuration, )
        .addField('A Számot a Listához Adta', song.user, )
        .addFields(status(queue))
        .setTimestamp()
    ))
    .on("searchResult", (message, result) => {
        message.channel.send(
            embed("🔎 Ezeket Találtam, Válaszd Ki Melyik Zenét Szeretnéd Lejátszani", result.map((song, index) => `**${++index}.** ${song.name}`).join("\n"))
            .setFooter("1 perced van választani a zenék közül!")
            .setTimestamp()
        );
    })
    .on("searchCancel", (message) => embed('Letelt az 1 perc, a bot nem vár tovább a válaszra!', '').setTimestamp().setTitle('⚠ Figyelem!').setColor('#CB4335'))
    .on("error", (message, err) => message.channel.send(
        embed(err, '').setTimestamp().setTitle('❌ Hiba!').setColor('#CB4335')
    )
);