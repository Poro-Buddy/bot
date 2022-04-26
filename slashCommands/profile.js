const { MessageEmbed } = require("discord.js");
const config = require("../botconfig/config.json");
const db = require('quick.db');
const moment = require('moment');
const premb = require("../botconfig/embed.json");
const emojis = require("../botconfig/emojis.json");
const settings = require("../botconfig/settings.json");
const IC = require("../botconfig/internalChannels.json");
var con = require("../db.js");
module.exports = {
  name: "profile", //the command name for the Slash Command
  description: "Gives information about your Poro profile", //the command description for Slash Command Overview
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

    let playerRP;
    let playerBE;
    let playerCapsules;
    let summonerName = null;
    let rankemb = "";

    con.query(`SELECT * FROM game_user WHERE id='${member.id}'`, function (err, res){
      if(res.length > 0){
        console.log(res[0]);
        playerBE = res[0].blue.toString()
        playerRP = res[0].rp.toString()
        playerCapsules = res[0].capsules.toString()
      } else {
        con.query(`INSERT INTO game_user (id) VALUES ('${member.id}')`)
        playerBE = 0
        playerRP = 0
        playerCapsules = 0
        const query1 = new MessageEmbed()
        .setTitle(`NEW GAME USER`)
        .addFields(
          {name: `USER`, value: `\`${member.user.tag}\``},
          {name: `ID`, vlaue: `\`${member.id}\``}
        )
        .setTimestamp()
        .setColor("GREEN");
        client.channels.cache.get(IC.queries).send({embeds: [query1]});
      }

      con.query(`SELECT region, summoner_name, summoner_icon, level, solo_rank, flex_rank FROM user_data WHERE discord='${member.id}'`, function (err, res1){
        console.log(err);
        if(res1.length > 0){
          console.log(res1[0]);
          if(res1[0].summoner_name != "NULL"){
            summonerIcon = res1[0].summoner_icon;
            summonerName = res1[0].summoner_name;
            region = res1[0].region;
            if(res1[0].solo_rank === "IRON")
                rankemb += `**Solo:** ${emojis.iron} Iron\n`
            else if(res1[0].solo_rank === "BRONZE")
                rankemb += `**Solo:** ${emojis.bronze} Bronze\n`
            else if(res1[0].solo_rank === "SILVER")
                rankemb += `**Solo:** ${emojis.silver} Silver\n`
            else if(res1[0].solo_rank === "GOLD")
                rankemb += `**Solo:** ${emojis.gold} Gold\n`
            else if(res1[0].solo_rank === "PLATINUM")
                rankemb += `**Solo:** ${emojis.platinum} Platinum\n`
            else if(res1[0].solo_rank === "DIAMOND")
                rankemb += `**Solo:** ${emojis.diamond} Diamond\n`
            else if(res1[0].solo_rank === "MASTER")
                rankemb += `**Solo:** ${emojis.master} Master\n`
            else if(res1[0].solo_rank === "GRANDMASTER")
                rankemb += `**Solo:** ${emojis.grandmaster} Grandmaster\n`
            else if(res1[0].solo_rank === "CHALLENGER")
                rankemb += `**Solo:** ${emojis.challenger} Challenger\n`
            else
                rankemb += `**Solo:** ${emojis.unranked} Unranked\n`
            if(res1[0].flex_rank === "IRON")
                rankemb += `**Flex:** ${emojis.iron} Iron\n`
            else if(res1[0].flex_rank === "BRONZE")
                rankemb += `**Flex:** ${emojis.bronze} Bronze\n`
            else if(res1[0].flex_rank === "SILVER")
                rankemb += `**Flex:** ${emojis.silver} Silver\n`
            else if(res1[0].flex_rank === "GOLD")
                rankemb += `**Flex:** ${emojis.gold} Gold\n`
            else if(res1[0].flex_rank === "PLATINUM")
                rankemb += `**Flex:** ${emojis.platinum} Platinum\n`
            else if(res1[0].flex_rank === "DIAMOND")
                rankemb += `**Flex:** ${emojis.diamond} Diamond\n`
            else if(res1[0].flex_rank === "MASTER")
                rankemb += `**Flex:** ${emojis.master} Master\n`
            else if(res1[0].flex_rank === "GRANDMASTER")
                rankemb += `**Flex:** ${emojis.grandmaster} Grandmaster\n`
            else if(res1[0].flex_rank === "CHALLENGER")
                rankemb += `**Flex:** ${emojis.challenger} Challenger\n`
            else
                rankemb += `**Flex:** ${emojis.unranked} Unranked\n`
          }
        }

        const meprofile = new MessageEmbed()
        .setTitle(`${member.user.username}'s profile`)
        .setThumbnail(summonerName ? `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${summonerIcon}.jpg` : member.user.displayAvatarURL())
        .addFields(
            {name: `User`, value: `${member} ${member.user.tag}\n(\`${member.id}\`)`, inline: true},
            {name: `Account Created`, value: `${moment(member.user.createdAt, "YYYYMMDD").fromNow()}`, inline: true},
            {name: `** **`, value: `** **`},
            {name: `Summoner Name`, value: summonerName ? `${summonerName} ${emojis.swords_colored} ${region}` : `${emojis.no} **Not Linked**\n\`/verify\``},
            {name: `Summoner Level`, value: summonerName ? `${res1[0].level}` : `${emojis.no} **Not Linked**\n\`/verify\``, inline: true},
            {name: `Rank`, value: summonerName ? rankemb : `${emojis.no} **Not Linked**\n\`/verify\``, inline:true},
            {name: `** **`, value: `** **`},
            {name: `Blue Essence`, value: `${emojis.blue} x ${playerBE}`, inline: true},
            {name: `RP`, value: `${emojis.rp} x ${playerRP}`, inline: true},
            {name: `Unopened Champion Capsules`, value: `${emojis.capsule} x ${playerCapsules}`, inline: true}
        )
        .setFooter(premb.footertext);

      //console.log(meprofile);
      //console.log(member);


        interaction.reply({embeds: [meprofile]})
      })
    });

    } catch (e) {
        console.log(String(e.stack).bgRed)
    }
  }
}
/**
  * @INFO
  * Bot Coded by Tomato#6966 | https://github.com/Tomato6966/Discord-Js-Handler-Template
  * @INFO
  * Work for Milrato Development | https://milrato.eu
  * @INFO
  * Please mention Him / Milrato Development, when using this Code!
  * @INFO
*/
