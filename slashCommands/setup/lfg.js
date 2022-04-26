const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const config = require("../../botconfig/config.json");
const emb = require("../../botconfig/embed.json");
const emojis = require("../../botconfig/emojis.json")
const settings = require("../../botconfig/settings.json");
const IC = require("../../botconfig/internalChannels.json");
var con = require("../../db.js");

module.exports = {
    name: "lfg", //the command name for the Slash Command
    description: "Setup looking for group, for your server!", //the command description for Slash Command Overview
    cooldown: 1,
    memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
    requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
    alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
    options: [ //OPTIONAL OPTIONS, make the array empty / dont add this option if you don't need options!	
      //INFORMATIONS! You can add Options, but mind that the NAME MUST BE LOWERCASED! AND NO SPACES!!!, for the CHOCIES you need to add a array of arrays; [ ["",""] , ["",""] ] 
          //{"Integer": { name: "ping_amount", description: "How many times do you want to ping?", required: true }}, //to use in the code: interacton.getInteger("ping_amount")
          //{"String": { name: "summoner_name", description: "Summoner name you are looking info about", required: true }}, //to use in the code: interacton.getString("ping_amount")
          //{"StringChoices": { name: "region", description: "What region is this Summoner from?", required: true, choices: [["EUNE", Constants.Regions.EU_EAST], ["EUWE", Constants.Regions.EU_WEST], ["LAN", Constants.Regions.LAT_NORTH], ["LAS", Constants.Regions.LAT_SOUTH], ["NA", Constants.Regions.AMERICA_NORTH], ["OCE", Constants.Regions.OCEANIA], ["JP", Constants.Regions.JAPAN]]}}
          //{"User": { name: "ping_a_user", description: "To Ping a user lol", required: false }}, //to use in the code: interacton.getUser("ping_a_user")
          {"Channel": { name: "existing_channel", description: "If you have channel already created for LFG, use that", required: false }}, //to use in the code: interacton.getChannel("what_channel")
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

            let databaseLog = client.channels.cache.get(IC.database);
            function insertDatabase(channel){
                let dblog = new MessageEmbed()
                    .setTitle(`LFG GUILD CHANNEL ADDED`)
                    .addFields(
                        {name: `GUILD`, value: `${guild.name} \`${guild.id}\``},
                        {name: `CHANNEL`, value: `${channel.name} \`${channel.id}\``}
                    )
                    .setTimestamp()
                    .setThumbnail(guild.iconURL());
                const success = new MessageEmbed()
                    .setTitle(`LFG CHANNEL REGISTERED!`)
                    .setDescription(`You have successfully setup Poro Buddy LFG channel to your server! Now your users (and other server users) can create LFG requests, that can be displayed to your server.\n\nApproved LFG requests will be displayed in ${channel}!`)
                    .setTimestamp()
                    .setThumbnail(guild.iconURL())
                    .setColor("GREEN");
                const infomsg = new MessageEmbed()
                    .setTitle(`PORO BUDDY LFG NOTIFICATIONS`)
                    .setThumbnail(guild.iconURL())
                    .setTimestamp()
                    .setFooter(emb.footertext)
                    .setDescription(`Poro Buddy wants to assist you with finding teammates, that might not be in this server (${guild.name}), so search globally new friends. If you are looking for Draft, Ranked, Flex, TFT, ARAM or RGM teammates with Poro just simply use command \`/lfg\`.\n\nOnce your LFG request has been approved it will be post here (${channel}) and to other servers with Poro Buddy's LFG setup.`)
                con.query(`SELECT * FROM lfg_channels WHERE guild='${guild.id}'`, function(e, r){
                    if(r.length > 0){
                        con.query(`UPDATE lfg_channels SET channel='${channel.id}' WHERE guild='${guild.id}'`);
                        dblog.setDescription(`${emojis.heart} Existing entry in database updated!`)
                        databaseLog.send({embeds: [dblog]});
                        interaction.reply({embeds: [success]});
                        channel.send({embeds: [infomsg]}).then(msg => msg.pin().catch(err => console.log(err)))
                    } else {
                        con.query(`INSERT INTO lfg_channels VALUES ('${guild.id}', '${channel.id}')`)
                        databaseLog.send({embeds: [dblog]});
                        interaction.reply({embeds: [success]});
                        channel.send({embeds: [infomsg]}).then(msg => msg.pin().catch(err => console.log(err)))
                    }
                })
            }
            let EC = options.getChannel("existing_channel")

            if(EC){
                if(EC.type == 'GUILD_TEXT' || EC.type == 'GUILD_NEWS'){
                    if(guild.me.permissionsIn(EC).has('SEND_MESSAGES')){
                        insertDatabase(EC);
                    }
                }
            } else {
                if(guild.me.permissions.has('MANAGE_CHANNELS')){
                    guild.channels.create('league-lfg', {
                        reason: 'Created channel for Poro Buddy LFG notifications',
                        type: 'GUILD_TEXT',
                        topic: 'Poro Buddy LFG notifications will be sent here, look for your own group by sending command /lfg',
                        parent: interaction.channel.parent
                    }).then(ch => {
                        insertDatabase(ch);
                    })
                }
            }
        } catch (e) {
            console.log(String(e.stack).bgRed)
        }
    }
}