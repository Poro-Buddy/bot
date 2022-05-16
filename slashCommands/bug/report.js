const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const emb = require("../../botconfig/embed.json");
const IC = require('../../botconfig/internalChannels.json')
const moment = require('moment');
var con = require("../../db.js");
const emojis = require("../../botconfig/emojis.json");
const ms = require("ms");
//var db = require("../../db.js");
module.exports = {
  name: "report", //the command name for the Slash Command
  description: "Report bug in Poro Buddy bot", //the command description for Slash Command Overview
  cooldown: 1,
  memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [ 
      	{"String": { name: "description", description: "Describe the issue you are having with the bot", required: true }}, //to use in the code: interacton.getString("ping_amount")
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

            let description = options.getString("description");
            if(description.length > 4096){
                const toolong = new MessageEmbed()
                .setAuthor({name: `Too long description`})
                .setDescription(`Your report description must not be longer than 4096 characters. Please edit your description to make it fit these bounderies.`)
                return interaction.reply({embeds: [toolong], ephemeral: true});
            } else {
                con.query(`INSERT INTO reports (reporter, reporter_tag, guild, description) VALUES ('${member.id}', '${member.user.tag}', '${guild.id}', '${description}')`, function(error, results, fields){
                    if (error) throw error;
                    const row = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('bug-approve')
                                .setLabel('APPROVE')
                                .setEmoji('964393439892475944')
                                .setStyle('SUCCESS'),
                            new MessageButton()
                                .setCustomId('bug-deny')
                                .setLabel('DENY')
                                .setStyle('DANGER')
                        )
                    const bugQueue = new MessageEmbed()
                    .setAuthor({name: `BUG WAITING APPROVAL`})
                    .setDescription(`${description}`)
                    .setFooter({text: `ID: ${results.insertId}`})
                    .addFields(
                        {name: `REPORTER`, value: `${member.user.tag}\n\`${member.id}\``, inline: true},
                        {name: `GUILD`, value: `${guild.name}\n\`${guild.id}\``, inline: true},
                        {name: `DATE`, value: `${moment().format(' DD/MM/YYYY HH:mm')}`}
                    )

                    client.channels.cache.get(IC.bugs_queue).send({embeds: [bugQueue], components: [row]})
                    interaction.reply({content: `Your bug report has been sent to our team for review, you will receive updates to your DMs. So make sure you have DMs enabled!`, ephemeral: true})
                });
            }

        } catch (e) {
            console.log(String(e.stack).bgRed)
        }
    }
}

function chance(){
    return Math.floor(Math.random() * 2) +1;
}