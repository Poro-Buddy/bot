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
        let puuid;
        let flexrank = "UNRANKED";
        let solorank = "UNRANKED";
        let icon = 0;
        let level = 0;
        let embed = new MessageEmbed()
        con.query(`SELECT * FROM queries WHERE name='${summoner}' AND region='${region}'`, function (eCheck, rCheck){
            console.log(eCheck)
            console.log(rCheck[0])
           if(rCheck.length > 0 && checkTime(rCheck[0].updated)){
               flexrank = rCheck[0].flex_rank;
               solorank = rCheck[0].solo_rank;
               icon += rCheck[0].icon;
               level += rCheck[0].level;
               puuid = rCheck[0].id;
               constructRankEmbed();
               constructEmbed();
               updateDatabase(rCheck.length > 0);
           } else {
                ritoapi.Summoner.getByName(summoner, region).then((values) => {
                    ritoapi.League.bySummoner(values.response.id, region).then((rank) => {
                        for(i = 0; i < rank.response.length; i++){
                            if(rank.response[i].queueType === "RANKED_SOLO_5x5") {
                                solorank = rank.response[i].tier
                            }
                            if(rank.response[i].queueType === "RANKED_FLEX_SR") {
                                flexrank = rank.response[i].tier 
                            }
                        }
                        level += values.response.summonerLevel;
                        icon += values.response.profileIconId;
                        puuid = values.response.puuid;
                        constructRankEmbed();
                        constructEmbed();
                        updateDatabase();
                        updateDatabase(rCheck.length > 0);
                    })
                })
           }
        });

        function constructRankEmbed(){
            if(solorank === "IRON")
                rankemb += `**Solo:** ${emojis.iron} Iron\n`
            else if(solorank === "BRONZE")
                rankemb += `**Solo:** ${emojis.bronze} Bronze\n`
            else if(solorank === "SILVER")
                rankemb += `**Solo:** ${emojis.silver} Silver\n`
            else if(solorank === "GOLD")
                rankemb += `**Solo:** ${emojis.gold} Gold\n`
            else if(solorank === "PLATINUM")
                rankemb += `**Solo:** ${emojis.platinum} Platinum\n`
            else if(solorank === "DIAMOND")
                rankemb += `**Solo:** ${emojis.diamond} Diamond\n`
            else if(solorank === "MASTER")
                rankemb += `**Solo:** ${emojis.master} Master\n`
            else if(solorank === "GRANDMASTER")
                rankemb += `**Solo:** ${emojis.grandmaster} Grandmaster\n`
            else if(solorank === "CHALLENGER")
                rankemb += `**Solo:** ${emojis.challenger} Challenger\n`
            else if(solorank === "UNRANKED")
                rankemb += `**Solo:** ${emojis.unranked} Unranked\n`


            if(flexrank === "IRON")
                rankemb += `**Flex:** ${emojis.iron} Iron\n`
            else if(flexrank === "BRONZE")
                rankemb += `**Flex:** ${emojis.bronze} Bronze\n`
            else if(flexrank === "SILVER")
                rankemb += `**Flex:** ${emojis.silver} Silver\n`
            else if(flexrank === "GOLD")
                rankemb += `**Flex:** ${emojis.gold} Gold\n`
            else if(flexrank === "PLATINUM")
                rankemb += `**Flex:** ${emojis.platinum} Platinum\n`
            else if(flexrank === "DIAMOND")
                rankemb += `**Flex:** ${emojis.diamond} Diamond\n`
            else if(flexrank === "MASTER")
                rankemb += `**Flex:** ${emojis.master} Master\n`
            else if(flexrank === "GRANDMASTER")
                rankemb += `**Flex:** ${emojis.grandmaster} Grandmaster\n`
            else if(flexrank === "CHALLENGER")
                rankemb += `**Flex:** ${emojis.challenger} Challenger\n`
            else if(flexrank === "UNRANKED")
                rankemb += `**Flex:** ${emojis.unranked} Unranked\n`
        }

        function constructEmbed(){
            console.log(summoner)
            console.log(level)
            console.log(rankemb)
            embed
            .setThumbnail(`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${icon}.jpg`)
            .setURL(`https://porobuddy.xyz/search?summoner_name=${encodeURIComponent(summoner)}&region=${region}`)
            .setTitle(`Found Summoner!`)
            .addFields(
                {name: `Summoner`, value: `${summoner}`, inline: true},
                {name: `Level`, value: `\`${level}\``, inline: true},
                {name: `** **`, value: `** **`},
                {name: `Ranked Placements`, value: `${rankemb}`}
            )

            interaction.reply({embeds: [embed]});
        }

        /**
         * 
         * @param {*} bool Boolean, false if insert new row
         */
        function updateDatabase(bool){
            if(!bool){
                con.query(`INSERT INTO queries (id, name, region, icon, level, solo_rank, flex_rank) VALUES (?, ?, '${region}', '${icon}', '${level}', '${solorank}', '${flexrank}')`, [puuid, summoner])
            } else {
                con.query(`UPDATE queries SET name=?, icon='${icon}', level='${level}', solo_rank='${solorank}', flex_rank='${flexrank}' WHERE id='${puuid}'`, [summoner])
            }
        }
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