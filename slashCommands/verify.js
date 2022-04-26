const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const config = require("../botconfig/config.json");
const emb = require("../botconfig/embed.json");
const emojis = require("../botconfig/emojis.json")
const settings = require("../botconfig/settings.json");
const {LolApi, Constants, queueType} = require('twisted');
const ritoapi = new LolApi({
  rateLimitRetry: true,
  rateLimitRetryAttempts: 1,
  key: config.riotAPI
});
//var db = require("../../db.js");
module.exports = {
  name: "verify", //the command name for the Slash Command
  description: "Verify your Summoner account, and link it to your Discord account", //the command description for Slash Command Overview
  cooldown: 1,
  memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [ 
    {"String": { name: "summoner_name", description: "What is your summoner name?", required: true }},
    {"StringChoices": { name: "region", description: "What region is this Summoner from?", required: true, choices: [["EUNE", Constants.Regions.EU_EAST], ["EUWE", Constants.Regions.EU_WEST], ["LAN", Constants.Regions.LAT_NORTH], ["LAS", Constants.Regions.LAT_SOUTH], ["NA", Constants.Regions.AMERICA_NORTH], ["OCE", Constants.Regions.OCEANIA], ["JP", Constants.Regions.JAPAN]]}}

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
		let summoner = options.getString("summoner_name");
		let region = options.getString("region");

    const notFound = new MessageEmbed()
      .setTitle(`We could not find the Summoner`)
      .setFooter(emb.footertext)
      .setDescription(`You tried to verify summoner \`${summoner}\` from region \`${region}\`\n\nAre you sure the region is correct?`);

    ritoapi.Summoner.getByName(summoner, region).then((values) => {
      console.log(values)
      const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setLabel(`Link Account`)
          .setStyle('LINK')
          .setURL(`https://porobuddy.xyz/verify?summoner=${values.response.puuid}&region=${region}&discord=${member.id}&summoner_name=${encodeURIComponent(values.response.name)}&summoner_icon=${values.response.summonerIconId}`)
      );
      const embed = new MessageEmbed()
        .setTitle(`Link your Summoner account`)
        .setFooter(emb.footertext)
        .setDescription(`To display information about your Summoner account on \`/profile\` command, and showing up in servers statistics.`)

      interaction.reply({embeds: [embed], components: [row], ephemeral: true});
    }).catch((err) => {
        interaction.reply({embeds: [notFound], ephemeral: true})
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
