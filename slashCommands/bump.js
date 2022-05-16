const { MessageEmbed } = require("discord.js");
const config = require("../botconfig/config.json");
const db = require('quick.db');
const moment = require('moment');
const ms = require('ms');
const premb = require("../botconfig/embed.json");
const emojis = require("../botconfig/emojis.json");
const settings = require("../botconfig/settings.json");
const IC = require("../botconfig/internalChannels.json");
var con = require("../db.js");
const { NULL } = require("mysql/lib/protocol/constants/types");
module.exports = {
  name: "bump", //the command name for the Slash Command
  description: "Bump server in Poro Buddy's site", //the command description for Slash Command Overview
  cooldown: 1,
  memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [ //OPTIONAL OPTIONS, make the array empty / dont add this option if you don't need options!	
	//INFORMATIONS! You can add Options, but mind that the NAME MUST BE LOWERCASED! AND NO SPACES!!!, for the CHOCIES you need to add a array of arrays; [ ["",""] , ["",""] ] 
		//{"Integer": { name: "ping_amount", description: "How many times do you want to ping?", required: true }}, //to use in the code: interacton.getInteger("ping_amount")
		//{"String": { name: "ping_amount", description: "How many times do you want to ping?", required: true }}, //to use in the code: interacton.getString("ping_amount")
		//{"User": { name: "ping_a_user", description: "To Ping a user lol", required: false }}, //to use in the code: interacton.getUser("ping_a_user")
		//{"Channel": { name: "what_channel", description: "To Ping a Channel lol", required: false }}, //to use in the code: interacton.getChannel("what_channel")
		//{"Role": { name: "what_role", description: "To Ping a Role lol", required: false }}, //to use in the code: interacton.getRole("what_role")
		//{"IntChoices": { name: "type", description: "What Ping do you want to get?", required: true, choices: [["Bot", 1], ["Discord Api", 2]] }, //here the second array input MUST BE A NUMBER // TO USE IN THE CODE: interacton.getInteger("type")
		//{"StringChoices": { name: "type", description: "What Ping do you want to get?", required: true, choices: [["Bot", "botping"], ["API", "api"]] }}, //here the second array input MUST BE A STRING // TO USE IN THE CODE: interacton.getString("type")
  ],
  run: async (client, interaction) => {
    try{
	    //console.log(interaction)
		
		//things u can directly access in an interaction!
		const { member, channelId, guildId, applicationId, 
		        commandName, deferred, replied, ephemeral, 
				    options, id, createdTimestamp 
		} = interaction; 
		const { guild } = member;

        const cooldown = 7200000;

        con.query(`SELECT * FROM serverlist WHERE server_id='${guild.id}'`, function (err, res){
            if(res.length > 0){
                var time = moment(res[0].last_bump);
                var timeNow = moment();
                var now = moment().format('YYYY-MM-DD HH:mm:ss');
                if(cooldown - (timeNow - time) > 0){
                    console.log("ay")
                    var waitTime = ms(cooldown - (timeNow - time), { long: true });
                    const nobumping = new MessageEmbed()
                    .setColor(`DARK_RED`)
                    .setTitle(`Bumping Failed...`)
                    .setFooter({text: premb.footertext, iconURL: client.user.displayAvatarURL()})
                    .setThumbnail(`https://assets.porobuddy.xyz/poros/sad.png`)
                    .setDescription(`Oh no... Seems like someone bumped the server recently. You must wait **${waitTime}** before bumping again!`)
                    interaction.reply({embeds: [nobumping]});
                } else {
                    let splashid = guild.splash ? guild.splash : NULL;
                    let iconhash = guild.icon ? guild.icon : NULL;
                    let memberscount = guild.memberCount;
                    con.query(`UPDATE serverlist SET iconhash='${iconhash}', splashid='${splashid}', members='${memberscount}', last_bump='${now}' WHERE server_id='${guild.id}'`);
                
                    const bumped = new MessageEmbed()
                    .setTitle(`Server Bumped Successfully!`)
                    .setColor(`WHITE`)
                    .setThumbnail(`https://assets.porobuddy.xyz/poros/laugh.png`)
                    .setFooter({text: premb.footertext, iconURL: client.user.displayAvatarURL()})
                    .setDescription(`You bumped your server on [Poro Buddy!](https://porobuddy.xyz)`)

                    interaction.reply({embeds: [bumped]});
                }
            }
        })

    } catch (e) {
        console.log(String(e.stack).bgRed)
    }
  }
}
function getDifferenceInHours(date1, date2) {
    const diffInMs = Math.abs(date2 - date1);
    return diffInMs / (1000 * 60 * 60);
  }