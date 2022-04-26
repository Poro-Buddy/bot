const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const config = require("../botconfig/config.json");
const emb = require("../botconfig/embed.json");
const emojis = require("../botconfig/emojis.json")
const settings = require("../botconfig/settings.json");
const IC = require("../botconfig/internalChannels.json");
var con = require("../db.js");

module.exports = {
    name: "lfg", //the command name for the Slash Command
    description: "Look for teammates for your game", //the command description for Slash Command Overview
    cooldown: 1,
    memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
    requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
    alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
    options: [ //OPTIONAL OPTIONS, make the array empty / dont add this option if you don't need options!	
      //INFORMATIONS! You can add Options, but mind that the NAME MUST BE LOWERCASED! AND NO SPACES!!!, for the CHOCIES you need to add a array of arrays; [ ["",""] , ["",""] ] 
          //{"Integer": { name: "ping_amount", description: "How many times do you want to ping?", required: true }}, //to use in the code: interacton.getInteger("ping_amount")
          {"String": { name: "message", description: "What kind of teammate are you looking for?", required: true }}, //to use in the code: interacton.getString("ping_amount")
          //{"StringChoices": { name: "region", description: "What region is this Summoner from?", required: true, choices: [["EUNE", Constants.Regions.EU_EAST], ["EUWE", Constants.Regions.EU_WEST], ["LAN", Constants.Regions.LAT_NORTH], ["LAS", Constants.Regions.LAT_SOUTH], ["NA", Constants.Regions.AMERICA_NORTH], ["OCE", Constants.Regions.OCEANIA], ["JP", Constants.Regions.JAPAN]]}},
          {"StringChoices": { name: "gamemode", description: "What gamemode are you looking for teammate for", required: true, choices: [["Blind/Draft Pick", "Blind/Draft Pick"], ["Ranked", "Ranked"], ["ARAM", "ARAM"], ["RGM", "RGM"]]}}
          //{"User": { name: "ping_a_user", description: "To Ping a user lol", required: false }}, //to use in the code: interacton.getUser("ping_a_user")
          //{"Channel": { name: "existing_channel", description: "If you have channel already created for LFG, use that", required: false }}, //to use in the code: interacton.getChannel("what_channel")
          //{"Role": { name: "what_role", description: "To Ping a Role lol", required: false }}, //to use in the code: interacton.getRole("what_role")
          //{"IntChoices": { name: "type", description: "What Ping do you want to get?", required: true, choices: [["Bot", 1], ["Discord Api", 2]] }, //here the second array input MUST BE A NUMBER // TO USE IN THE CODE: interacton.getInteger("type")
          //{"StringChoices": { name: "type", description: "What Ping do you want to get?", required: true, choices: [["Bot", "botping"], ["API", "api"]] }}, //here the second array input MUST BE A STRING // TO USE IN THE CODE: interacton.getString("type")
    ],
    run: async (client, interaction) => {
        try {
            const { member, channelId, guildId, applicationId, 
		        commandName, deferred, replied, ephemeral, 
				options, id, createdTimestamp 
            } = interaction; 
            const { guild } = member;

            let message = options.getString("message");
            //let region = options.getString("region");
            let gamemode = options.getString("gamemode");

            con.query(`SELECT region, summoner_name, summoner_id, summoner_icon, level, solo_rank, flex_rank, lfg_lock FROM user_data WHERE discord='${member.id}'`, function (err, res){
                if(res.length > 0){
                    if(res[0].lfg_lock == 1){
                        const lockedout = new MessageEmbed()
                        .setTitle(`YOU HAVE BEEN LOCKED OUT!`)
                        .setDescription(`You have been locked out from sending LFG requests as our Moderation team has found you abusing the system.`)
                        .setColor("RED")
                        .setFooter(emb.footertext);

                        return interaction.reply({embeds: [lockedout], ephemeral: true});
                    }
                    con.query(`SELECT approved, date FROM lfg_messages WHERE user_id='${member.id}' AND approved='0'`, function(erc, resc){
                        if(resc.length == 0){
                            let queuechannel = client.channels.cache.get(IC["lfg-queue"]);
                            const row = new MessageActionRow()
                                .addComponents(
                                    new MessageButton()
                                        .setCustomId('lfg-approve')
                                        .setLabel('APPROVE')
                                        .setEmoji('964393439892475944')
                                        .setStyle('SUCCESS'),
                                    new MessageButton()
                                        .setCustomId('lfg-deny')
                                        .setLabel('DENY')
                                        .setStyle('DANGER')
                                )
                            const queuemsg = new MessageEmbed()
                            .setTitle(`LFG REVIEW`)
                            .setTimestamp()
                            .setDescription(`*${message}*`)
                            .setFooter(member.id)
                            .setThumbnail(`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${res[0].summoner_icon}.jpg`)
                            .addFields(
                                {name: `USER`, value: `${member.user.tag} \`${member.id}\``, inline: true},
                                {name: `ORIGIN GUILD`, value: `${guild.name} \`${guild.id}\``, inline: true},
                                {name: `** **`, value: `** **`},
                                {name: `Summoner`, value: `${res[0].summoner_name} | \`${res[0].region}\``, inline: true},
                                {name: `Gamemode`, value: `${gamemode}`, inline: true}
                            );
                            queuechannel.send({embeds: [queuemsg], components: [row]}).then(msg => {
                                interaction.reply({content: `Your LFG request has been sent to queue for approval!`, ephemeral: true})
                                con.query(`INSERT INTO lfg_messages (user_id, user_name, summoner_id, message, gamemode, queue_message) VALUES ('${member.id}', '${member.user.tag}', '${res[0].summoner_id}', '${message}', '${gamemode}', '${msg.id}')`)
                            })
                        } else {
                            const oldlfg = new MessageEmbed()
                            .setTitle(`WAITING APPROVAL`)
                            .setColor("RED")
                            .setDescription(`You have already sent a LFG message that is waiting for approval. Please wait for approval before sending new LFG request.`)
                            .setFooter(emb.footertext);
                            
                            interaction.reply({embeds: [oldlfg], ephemeral: true})
                        }
                    })
                } else {
                    const notverified = new MessageEmbed()
                    .setTitle(`NOT VERIFIED`)
                    .setColor("RED")
                    .setFooter(emb.footertext)
                    .setThumbnail(member.displayAvatarURL())
                    .setDescription(`You have not linked/verified your Summoner account with Poro Buddy. Do that before looking for group!\n\n\`/verify\``)
                    interaction.reply({embeds: [notverified], ephemeral: true});
                }
            })

        } catch (e) {
            console.log(String(e.stack).bgRed)
        }
    }
}