const { MessageEmbed, RateLimitError } = require("discord.js");
const config = require("../botconfig/config.json");
const db = require('quick.db');
const moment = require('moment');
const emb = require("../botconfig/embed.json");
const emojis = require("../botconfig/emojis.json");
const settings = require("../botconfig/settings.json");
const {LolApi, Constants, queueType} = require('twisted');
const request = require('request');
const ritoapi = new LolApi({
    rateLimitRetry: true,
    rateLimitRetryAttempts: 1,
    key: config.riotAPI
});
const IC = require("../botconfig/internalChannels.json");
var con = require("../db.js");
module.exports = {
  name: "search", //the command name for the Slash Command
  description: "Search information about certain summoner", //the command description for Slash Command Overview
  cooldown: 1,
  memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [ //OPTIONAL OPTIONS, make the array empty / dont add this option if you don't need options!	
	//INFORMATIONS! You can add Options, but mind that the NAME MUST BE LOWERCASED! AND NO SPACES!!!, for the CHOCIES you need to add a array of arrays; [ ["",""] , ["",""] ] 
		//{"Integer": { name: "ping_amount", description: "How many times do you want to ping?", required: true }}, //to use in the code: interacton.getInteger("ping_amount")
		{"String": { name: "summoner_name", description: "Summoner name you are looking info about", required: true }}, //to use in the code: interacton.getString("ping_amount")
		{"StringChoices": { name: "region", description: "What region is this Summoner from?", required: true, choices: [["EUNE", Constants.Regions.EU_EAST], ["EUWE", Constants.Regions.EU_WEST], ["LAN", Constants.Regions.LAT_NORTH], ["LAS", Constants.Regions.LAT_SOUTH], ["NA", Constants.Regions.AMERICA_NORTH], ["OCE", Constants.Regions.OCEANIA], ["JP", Constants.Regions.JAPAN]]}}
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

        let summoner = options.getString("summoner_name");
		let region = options.getString("region");
        let rankemb = "";
        let flexRank = "UNRANKED";
        let soloRank = "UNRANKED";
        let mastery3 = "working on it\n";

        let queryChannel = client.channels.cache.get(IC.queries);
        //console.log(queryChannel);
        function queryLog(database){
            let successfulQuery = new MessageEmbed()
                .setTitle(`SUCCESSFUL QUERY`)
                .addFields(
                    {name: `USER`, value: member.user.tag, inline: true},
                    {name: `GUILD`, value: `${member.guild.name}\n\`${member.guild.id}\``, inline: true},
                    {name: `QUERY`, value: `${summoner} (${region})`}
        
                )
                .setTimestamp()
                .setColor("GREEN");
        
            if (database){
                try {
                    successfulQuery.setDescription(`${emojis.heart} RIOT API queried & database updated!`);
                    queryChannel.send({embeds: [successfulQuery]});
                } catch(e){
                    console.log(e);
                }
            } else {
                try {
                    queryChannel.send({embeds: [successfulQuery]});
                } catch(e){
                    console.log(e);
                }
            }
        }

        const notFound = new MessageEmbed()
            .setTitle(`We could not find the Summoner`)
            .setFooter(emb.footertext)
            .setDescription(`You tried to search summoner \`${summoner}\` from region \`${region}\`\n\nMaybe try searching from different region?`);

        const unsuccessfulQuery = new MessageEmbed()
            .setTitle(`UNSUCCESSFUL QUERY`)
            .addFields(
                {name: `USER`, value: member.user.tag, inline: true},
                {name: `GUILD`, value: `${member.guild.name}\n\`${member.guild.id}\``, inline: true},
                {name: `QUERY`, value: `${summoner} (${region})`}

            )
            .setTimestamp()
            .setColor("RED");

        con.query(`SELECT * FROM queries WHERE name='${summoner}' AND region='${region}'`, function (err, res){
            if(res.length > 0 && checkTime(res[0].updated)){
                console.log(`FOUND FROM DATABASE OLD STUFF`)
                 
                if(res[0].solo_rank === "IRON")
                    rankemb += `**Solo:** ${emojis.iron} Iron\n`
                else if(res[0].solo_rank === "BRONZE")
                    rankemb += `**Solo:** ${emojis.bronze} Bronze\n`
                else if(res[0].solo_rank === "SILVER")
                    rankemb += `**Solo:** ${emojis.silver} Silver\n`
                else if(res[0].solo_rank === "GOLD")
                    rankemb += `**Solo:** ${emojis.gold} Gold\n`
                else if(res[0].solo_rank === "PLATINUM")
                    rankemb += `**Solo:** ${emojis.platinum} Platinum\n`
                else if(res[0].solo_rank === "DIAMOND")
                    rankemb += `**Solo:** ${emojis.diamond} Diamond\n`
                else if(res[0].solo_rank === "MASTER")
                    rankemb += `**Solo:** ${emojis.master} Master\n`
                else if(res[0].solo_rank === "GRANDMASTER")
                    rankemb += `**Solo:** ${emojis.grandmaster} Grandmaster\n`
                else if(res[0].solo_rank === "CHALLENGER")
                    rankemb += `**Solo:** ${emojis.challenger} Challenger\n`
                else
                    rankemb += `**Solo:** ${emojis.unranked} Unranked\n`


                if(res[0].flex_rank === "IRON")
                    rankemb += `**Flex:** ${emojis.iron} Iron\n`
                else if(res[0].flex_rank === "BRONZE")
                    rankemb += `**Flex:** ${emojis.bronze} Bronze\n`
                else if(res[0].flex_rank === "SILVER")
                    rankemb += `**Flex:** ${emojis.silver} Silver\n`
                else if(res[0].flex_rank === "GOLD")
                    rankemb += `**Flex:** ${emojis.gold} Gold\n`
                else if(res[0].flex_rank === "PLATINUM")
                    rankemb += `**Flex:** ${emojis.platinum} Platinum\n`
                else if(res[0].flex_rank === "DIAMOND")
                    rankemb += `**Flex:** ${emojis.diamond} Diamond\n`
                else if(res[0].flex_rank === "MASTER")
                    rankemb += `**Flex:** ${emojis.master} Master\n`
                else if(res[0].flex_rank === "GRANDMASTER")
                    rankemb += `**Flex:** ${emojis.grandmaster} Grandmaster\n`
                else if(res[0].flex_rank === "CHALLENGER")
                    rankemb += `**Flex:** ${emojis.challenger} Challenger\n`
                else if(res[0].flex_rank === "UNRANKED")
                    rankemb += `**Flex:** ${emojis.unranked} Unranked\n`

            const searchFound = new MessageEmbed()
                .setTitle(`Found Summoner!`)
                .setThumbnail(`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${res[0].icon.toString()}.jpg`)
                .addFields(
                    {name: `Summoner name`, value: res[0].name, inline: true},
                    {name: `Summoner level`, value: res[0].level.toString(), inline: true},
                    {name: `** **`, value: `** **`},
                    {name: `TOP 3 mastery`, value: mastery3, inline: true},
                    {name: `Ranked`, value: rankemb, inline: true}
                )
            interaction.reply({embeds: [searchFound], ephemeral: false});
            queryLog(false)
            }
            else {
                ritoapi.Summoner.getByName(summoner, region).then((values) => {
                    ritoapi.League.bySummoner(values.response.id, region).then((rank) => {
                        ritoapi.Champion.masteryBySummoner(values.response.id, region).then((mastery) => {      
                            for(i = 0; i <= 2; i++){
                                mastery3 += `**${i + 1}.** ${getChampName(mastery.response[i].championId)} ${emojis.mastery} ${mastery.response[i].championPoints}\n`
                            }
        
                            for(i = 0; i < rank.response.length; i++){
                                if(rank.response[i].queueType === "RANKED_SOLO_5x5") {
                                    soloRank = rank.response[i].tier 
                                    if(rank.response[i].tier === "IRON")
                                        rankemb += `**Solo:** ${emojis.iron} Iron\n`
                                    else if(rank.response[i].tier === "BRONZE")
                                        rankemb += `**Solo:** ${emojis.bronze} Bronze\n`
                                    else if(rank.response[i].tier === "SILVER")
                                        rankemb += `**Solo:** ${emojis.silver} Silver\n`
                                    else if(rank.response[i].tier === "GOLD")
                                        rankemb += `**Solo:** ${emojis.gold} Gold\n`
                                    else if(rank.response[i].tier === "PLATINUM")
                                        rankemb += `**Solo:** ${emojis.platinum} Platinum\n`
                                    else if(rank.response[i].tier === "DIAMOND")
                                        rankemb += `**Solo:** ${emojis.diamond} Diamond\n`
                                    else if(rank.response[i].tier === "MASTER")
                                        rankemb += `**Solo:** ${emojis.master} Master\n`
                                    else if(rank.response[i].tier === "GRANDMASTER")
                                        rankemb += `**Solo:** ${emojis.grandmaster} Grandmaster\n`
                                    else if(rank.response[i].tier === "CHALLENGER")
                                        rankemb += `**Solo:** ${emojis.challenger} Challenger\n`
                                    else
                                        rankemb += `**Solo:** ${emojis.unranked} Unranked\n`
                                }
                                if(rank.response[i].queueType === "RANKED_FLEX_SR") {
                                    flexRank = rank.response[i].tier 
                                    if(rank.response[i].tier === "IRON")
                                        rankemb += `**Flex:** ${emojis.iron} Iron\n`
                                    else if(rank.response[i].tier === "BRONZE")
                                        rankemb += `**Flex:** ${emojis.bronze} Bronze\n`
                                    else if(rank.response[i].tier === "SILVER")
                                        rankemb += `**Flex:** ${emojis.silver} Silver\n`
                                    else if(rank.response[i].tier === "GOLD")
                                        rankemb += `**Flex:** ${emojis.gold} Gold\n`
                                    else if(rank.response[i].tier === "PLATINUM")
                                        rankemb += `**Flex:** ${emojis.platinum} Platinum\n`
                                    else if(rank.response[i].tier === "DIAMOND")
                                        rankemb += `**Flex:** ${emojis.diamond} Diamond\n`
                                    else if(rank.response[i].tier === "MASTER")
                                        rankemb += `**Flex:** ${emojis.master} Master\n`
                                    else if(rank.response[i].tier === "GRANDMASTER")
                                        rankemb += `**Flex:** ${emojis.grandmaster} Grandmaster\n`
                                    else if(rank.response[i].tier === "CHALLENGER")
                                        rankemb += `**Flex:** ${emojis.challenger} Challenger\n`
                                    else
                                        rankemb += `**Flex:** ${emojis.unranked} Unranked\n`
                                }
                            }
        
        
                        const searchFound = new MessageEmbed()
                            .setTitle(`Found Summoner!`)
                            .setThumbnail(`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${values.response.profileIconId.toString()}.jpg`)
                            .addFields(
                                {name: `Summoner name`, value: values.response.name, inline: true},
                                {name: `Summoner level`, value: values.response.summonerLevel.toString(), inline: true},
                                {name: `** **`, value: `** **`},
                                {name: `TOP 3 mastery`, value: mastery3, inline: true},
                                {name: `Ranked`, value: rankemb, inline: true}
                            )
                        interaction.reply({embeds: [searchFound], ephemeral: false});
                        if(res.length == 0){
                            con.query(`SELECT id, name FROM queries WHERE id='${values.response.puuid}' AND region='${region}'`, function (err2, res2){
                                if(res2.length > 0){
                                    queryLog(true, queryChannel)
                                    con.query(`UPDATE queries SET name='${values.response.name}', region='${region}', icon='${values.response.profileIconId}', level='${values.response.summonerLevel}', solo_rank='${soloRank}', flex_rank='${flexRank}', updated='${moment().format('YYYY-MM-DD HH:mm:ss')}' WHERE id='${values.response.puuid}'`)
                                } else {
                                    queryLog(true, queryChannel)
                                    con.query(`INSERT INTO queries (id, name, region, icon, level, solo_rank, flex_rank) VALUES ('${values.response.puuid}', '${values.response.name}', '${region}', '${values.response.profileIconId}', '${values.response.summonerLevel}', '${soloRank}', '${flexRank}')`)
                                }
                            })
                        } else {
                            con.query(`SELECT id, name FROM queries WHERE id='${values.response.puuid}' AND region='${region}'`, function (err2, res2){
                                if(res2.length > 0){
                                    queryLog(true, queryChannel)
                                    con.query(`UPDATE queries SET name='${values.response.name}', region='${region}', icon='${values.response.profileIconId}', level='${values.response.summonerLevel}', solo_rank='${soloRank}', flex_rank='${flexRank}', updated='${moment().format('YYYY-MM-DD HH:mm:ss')}' WHERE id='${values.response.puuid}'`)
                                } else {
                                    queryLog(true, queryChannel)
                                    con.query(`INSERT INTO queries (id, name, region, icon, level, solo_rank, flex_rank) VALUES ('${values.response.puuid}', '${values.response.name}', '${region}', '${values.response.profileIconId}', '${values.response.summonerLevel}', '${soloRank}', '${flexRank}')`)
                                }
                            })
                        }
                        });
                    });
                }).catch((err) => {
                    interaction.reply({embeds: [notFound], ephemeral: true})
                    queryChannel.send({embeds: [unsuccessfulQuery]});
                })
            }
        })
    } catch (e) {
        console.log(String(e.stack).bgRed)
    }
  }
}


function getChampName(id) {
    request('http://ddragon.leagueoflegends.com/cdn/10.15.1/data/de_DE/champion.json', function (error, response, body) {
        let list = JSON.parse(body);
        let championList = list.data;

        for (var i in championList) {
            if (championList[i].key == id) {
                //console.log(championList[i].id)
                return new Promise((res, rej) => {
                    res(championList[i].id);
                });
            }

        //console.log(championList[i].id + " | " + championList[i].key);
        }
    });
}

function checkTime(date){
    let hours = moment().diff(moment(date), 'hours');
    if( hours < 5){
        return true;
    } else {
        return false;
    }
}