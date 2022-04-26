const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const config = require("../../botconfig/config.json");
const emb = require("../../botconfig/embed.json");
const emojis = require("../../botconfig/emojis.json")
const settings = require("../../botconfig/settings.json");
const IC = require("../../botconfig/internalChannels.json");
var con = require("../../db.js");
const db = require('quick.db');

module.exports = {
    name: "changelogs", //the command name for the Slash Command
    description: "Managing changelogs", //the command description for Slash Command Overview
    cooldown: 1,
    memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
    requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
    alloweduserids: ['102756256556519424'], //Only allow specific Users to execute a Command [OPTIONAL]
    options: [ //OPTIONAL OPTIONS, make the array empty / dont add this option if you don't need options!	
      //INFORMATIONS! You can add Options, but mind that the NAME MUST BE LOWERCASED! AND NO SPACES!!!, for the CHOCIES you need to add a array of arrays; [ ["",""] , ["",""] ] 
          //{"Integer": { name: "ping_amount", description: "How many times do you want to ping?", required: true }}, //to use in the code: interacton.getInteger("ping_amount")
          {"String": { name: "update", description: "Update", required: true }}, //to use in the code: interacton.getString("ping_amount")
          //{"StringChoices": { name: "region", description: "What region is this Summoner from?", required: true, choices: [["EUNE", Constants.Regions.EU_EAST], ["EUWE", Constants.Regions.EU_WEST], ["LAN", Constants.Regions.LAT_NORTH], ["LAS", Constants.Regions.LAT_SOUTH], ["NA", Constants.Regions.AMERICA_NORTH], ["OCE", Constants.Regions.OCEANIA], ["JP", Constants.Regions.JAPAN]]}},
          //{"StringChoices": { name: "gamemode", description: "What gamemode are you looking for teammate for", required: true, choices: [["Blind/Draft Pick", "Blind/Draft Pick"], ["Ranked", "Ranked"], ["ARAM", "ARAM"], ["RGM", "RGM"]]}}
          //{"User": { name: "ping_a_user", description: "To Ping a user lol", required: false }}, //to use in the code: interacton.getUser("ping_a_user")
          //{"Channel": { name: "existing_channel", description: "If you have channel already created for LFG, use that", required: false }}, //to use in the code: interacton.getChannel("what_channel")
          //{"Role": { name: "what_role", description: "To Ping a Role lol", required: false }}, //to use in the code: interacton.getRole("what_role")
          //{"IntChoices": { name: "type", description: "Major, minor, what? (Major gets ping)", required: true, choices: [["Major", 1], ["Minor", 2], ["Patch", 3]] }, //here the second array input MUST BE A NUMBER // TO USE IN THE CODE: interacton.getInteger("type")
          {"StringChoices": { name: "type", description: "What Ping do you want to get?", required: true, choices: [["Major", "major"], ["Minor", "minor"], ["Patch", "patch"]] }}, //here the second array input MUST BE A STRING // TO USE IN THE CODE: interacton.getString("type")
    ],
    run: async (client, interaction) => {
        try {
            const { member, channelId, guildId, applicationId, 
		        commandName, deferred, replied, ephemeral, 
				options, id, createdTimestamp 
            } = interaction; 
            const { guild } = member;
            const updateMsg = options.getString("update");
            const type = options.getString("type");
            const changeNumber = db.get(`changelog.number`) +1 || 0 +1;

            db.set(`changelog.number`, changeNumber);

            if(updateMsg == 'reset'){
                db.set(`changelog.number`, 0);
                return interaction.reply({content: `Changelog counter reset`, ephemeral: true});
            }
            const update = new MessageEmbed()
            .setTitle(`#${changeNumber} Changelog - ${type.toUpperCase()}`)
            .setDescription(updateMsg)
            .setThumbnail(guild.iconURL())
            .setFooter(emb.footertext)
            .setTimestamp();

            client.channels.cache.get(IC.changelogs).send({content: `${type == 'major' ? `@everyone` : ` `}`, embeds: [update]}).then(msg => {
                msg.crosspost();
            });
            interaction.reply({ content: `Your update has been posted to ${client.channels.cache.get(IC.changelogs)}!`, ephemeral: true})

        } catch (e) {
            console.log(String(e.stack).bgRed)
        }
    }
}