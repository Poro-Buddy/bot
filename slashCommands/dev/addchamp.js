const { MessageEmbed } = require("discord.js");
const config = require("../../botconfig/config.json");
const emb = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
var db = require("../../db.js");
module.exports = {
  name: "addchamp", //the command name for the Slash Command
  description: "Add champion to the game's database", //the command description for Slash Command Overview
  cooldown: 1,
  memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: ['102756256556519424'], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [ //OPTIONAL OPTIONS, make the array empty / dont add this option if you don't need options!	
	//INFORMATIONS! You can add Options, but mind that the NAME MUST BE LOWERCASED! AND NO SPACES!!!, for the CHOCIES you need to add a array of arrays; [ ["",""] , ["",""] ] 
		//{"Integer": { name: "ping_amount", description: "How many times do you want to ping?", required: true }}, //to use in the code: interacton.getInteger("ping_amount")
		{"String": { name: "char_name", description: "Name of the Character", required: true }}, //to use in the code: interacton.getString("ping_amount")
        {"String": { name: "image_url", description: "URL for the image", required: true}},
        {"StringChoices": { name: "rarity", description: "Champions rarity", required: true, choices: [["Standard", "standard"], ["Epic", "epic"], ["Legendary", "legendary"], ["Mythic", "mythic"], ["Ultimate", "ultimate"]] }}, //here the second array input MUST BE A STRING // TO USE IN THE CODE: interacton.getString("type")
		//{"User": { name: "ping_a_user", description: "To Ping a user lol", required: false }}, //to use in the code: interacton.getUser("ping_a_user")
		//{"Channel": { name: "what_channel", description: "To Ping a Channel lol", required: false }}, //to use in the code: interacton.getChannel("what_channel")
		//{"Role": { name: "what_role", description: "To Ping a Role lol", required: false }}, //to use in the code: interacton.getRole("what_role")
		//{"IntChoices": { name: "type", description: "What Ping do you want to get?", required: true, choices: [["Bot", 1], ["Discord Api", 2]] }, //here the second array input MUST BE A NUMBER // TO USE IN THE CODE: interacton.getInteger("type")
		//{"StringChoices": { name: "type", description: "What Ping do you want to get?", required: true, choices: [["Bot", "botping"], ["API", "api"]] }}, //here the second array input MUST BE A STRING // TO USE IN THE CODE: interacton.getString("type")
  ],
  run: async (client, interaction) => {
    try{
	    //console.log(interaction, StringOption)
		
		//things u can directly access in an interaction!
		const { member, channelId, guildId, applicationId, 
		        commandName, deferred, replied, ephemeral, 
				options, id, createdTimestamp 
		} = interaction; 
		const { guild } = member;
		const championName = options.getString("char_name"); //same as in StringChoices
        const imageUrl = options.getString("image_url");
        const championRarity = options.getString("rarity").toLowerCase();

        db.query(`SELECT * FROM game_champs WHERE image = '${imageUrl}'`, function(err, res){
            if(res.length == 0){
                db.query(`INSERT INTO game_champs VALUES (NULL, '${championName}', '${imageUrl}', '${championRarity}')`);
                
                const embed = new MessageEmbed()
                    .setTitle(`New champion added to the Poro Buddy game!`)
                    .setImage(imageUrl)
                    .addFields(
                        {name: `Champion name`, value: championName, inline: true},
                        {name: `Rarity`, value: championRarity, inline: true},
                        {name: `Art URL`, value: imageUrl}
                    );

                interaction.reply({embeds: [embed], ephemeral: true});
            } else {
                console.log(err);
                console.log(res);
            }
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
