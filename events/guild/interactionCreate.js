//Import Modules
const ee = require(`../../botconfig/embed.json`);
const settings = require(`../../botconfig/settings.json`);
const { onCoolDown, replacemsg } = require("../../handlers/functions");
const Discord = require("discord.js");
var con = require("../../db.js");
const emojis = require("../../botconfig/emojis.json");
const IC = require('../../botconfig/internalChannels.json');
module.exports = (client, interaction) => {
	const CategoryName = interaction.commandName;
	let command = false;
  let button = false;
	try{
    	    if (client.slashCommands.has(CategoryName + interaction.options.getSubcommand())) {
      		command = client.slashCommands.get(CategoryName + interaction.options.getSubcommand());
    	    }
  	}catch{
    	    if (client.slashCommands.has("normal" + CategoryName)) {
      		command = client.slashCommands.get("normal" + CategoryName);
   	    }
	}
  try{
    if(interaction.isButton()){
      button = true;
    } else {
      button = false;
    }
  }catch (e) {
    console.log(String(e.stack).bgRed)
  }
	if(command) {
		if (onCoolDown(interaction, command)) {
			  return interaction.reply({ephemeral: true,
				embeds: [new Discord.MessageEmbed()
				  .setColor(ee.wrongcolor)
				  .setFooter(ee.footertext, ee.footericon)
				  .setTitle(replacemsg(settings.messages.cooldown, {
					command: command,
					timeLeft: onCoolDown(interaction, command)
				  }))]
			  });
			}
		//if Command has specific permission return error
        if (command.memberpermissions && command.memberpermissions.length > 0 && !interaction.member.permissions.has(command.memberpermissions)) {
          return interaction.reply({ ephemeral: true, embeds: [new Discord.MessageEmbed()
              .setColor(ee.wrongcolor)
              .setFooter(ee.footertext, ee.footericon)
              .setTitle(replacemsg(settings.messages.notallowed_to_exec_cmd.title))
              .setDescription(replacemsg(settings.messages.notallowed_to_exec_cmd.description.memberpermissions, {
                command: command,
              }))]
          });
        }
        //if Command has specific needed roles return error
        if (command.requiredroles && command.requiredroles.length > 0 && interaction.member.roles.cache.size > 0 && !interaction.member.roles.cache.some(r => command.requiredroles.includes(r.id))) {
          return interaction.reply({ ephemeral: true, embeds: [new Discord.MessageEmbed()
            .setColor(ee.wrongcolor)
            .setFooter(ee.footertext, ee.footericon)
            .setTitle(replacemsg(settings.messages.notallowed_to_exec_cmd.title))
            .setDescription(replacemsg(settings.messages.notallowed_to_exec_cmd.description.requiredroles, {
              command: command,
			}))]
          })
        }
        //if Command has specific users return error
        if (command.alloweduserids && command.alloweduserids.length > 0 && !command.alloweduserids.includes(interaction.member.id)) {
          return interaction.reply({ ephemeral: true, embeds: [new Discord.MessageEmbed()
            .setColor(ee.wrongcolor)
            .setFooter(ee.footertext, ee.footericon)
            .setTitle(replacemsg(settings.messages.notallowed_to_exec_cmd.title))
            .setDescription(replacemsg(settings.messages.notallowed_to_exec_cmd.description.alloweduserids, {
              command: command,
            }))]
          });
        }
        //if Command has specific guild return error
        if (command.allowedGuilds && command.allowedGuilds.length > 0 && !command.allowedGuilds.includes(interaction.guild.id)) {
          return interaction.reply({ ephemeral: true, embeds: [new Discord.MessageEmbed()
            .setColor(ee.wrongcolor)
            .setFooter(ee.footertext, ee.footericon)
            .setTitle(`Invalid guild!`)
            .setDescription(`You can't use this command in this guild!`)]
          });
        }
		//execute the Command
		command.run(client, interaction, interaction.member, interaction.guild)
	}
  // DOING BUTTON STUFF!
  if(button){
    //console.log(interaction);
    // ----------- LFG APPROVE BUTTONS START ----------- //
    if(interaction.customId == 'lfg-approve'){
      let msgUser = interaction.message.embeds[0].footer.text;
      let oldEmbed = interaction.message.embeds[0];
      oldEmbed.setFooter({text: `HANDLED BY ${interaction.member.user.tag}`}).setColor("GREEN").setTitle(`LFG REVIEW APPROVED!`)
      con.query(`UPDATE lfg_messages SET approved='1' WHERE user_id='${msgUser}' AND queue_message='${interaction.message.id}'`);
      interaction.message.edit({embeds: [oldEmbed], components: []});
      interaction.reply({content: `${emojis.heart} You have **approved** LFG request successfully!`, ephemeral: true})

      con.query(`SELECT * FROM lfg_messages WHERE user_id='${msgUser}' AND queue_message='${interaction.message.id}'`, function (infoerr, infores){
        const lfgmsg = new Discord.MessageEmbed()
          .setTitle(`LOOKING FOR ${infores[0].gamemode}`)
          .setColor("RANDOM")
          .setDescription(infores[0].message)
          .setTimestamp(infores[0].date)
          .setFooter(ee.footertext)
          .setThumbnail(oldEmbed.thumbnail.url)
          .addFields(
            {name: `Summoner`, value: `${oldEmbed.fields[3].value}`, inline: true},
            {name: `Discord username`, value: `${infores[0].user_name}`, inline: true}
          )

        //SENDING TO ALL CHANNELS!
        con.query(`SELECT * FROM lfg_channels`, function(err, res){
          for (i = 0; i < res.length; i++){
            let lfgChannel = client.channels.cache.get(res[i].channel)
            lfgChannel.send({embeds: [lfgmsg]});
          }
        })
      })
    }
    if(interaction.customId == 'lfg-deny'){
      let msgUser = interaction.message.embeds[0].footer.text;
      let oldEmbed = interaction.message.embeds[0];
      oldEmbed.setFooter({text: `HANDLED BY ${interaction.member.user.tag}`}).setColor("RED").setTitle(`LFG REVIEW DENIED!`)
      con.query(`DELETE FROM lfg_messages WHERE user_id='${msgUser}' AND queue_message='${interaction.message.id}'`);
      interaction.message.edit({embeds: [oldEmbed], components: []});
      interaction.reply({content: `${emojis.no} You have **denied** LFG request successfully!`, ephemeral: true})
    }
    // ----------- LFG APPROVE BUTTONS END ----------- //
    // ----------- BUG APPROVE BUTTONS START ----------- //
    if(interaction.customId == 'bug-approve'){
      let bugID = interaction.message.embeds[0].footer.text.split(' ');
      console.log(bugID[1])
      let oldEmbed = interaction.message.embeds[0];
      oldEmbed.setFooter({text: `HANDLED BY ${interaction.member.user.tag}`}).setColor("GREEN").setAuthor({name: `BUG APPROVED`, iconURL: interaction.member.displayAvatarURL()})
      interaction.message.edit({embeds: [oldEmbed], components: []});
      interaction.reply({content: `${emojis.heart} You have **approved** bug report successfully!`, ephemeral: true})

      con.query(`SELECT * FROM reports WHERE id='${bugID[1]}'`, function (err, res){
        let user = client.guilds.cache.get(res[0].guild).members.cache.get(res[0].reporter);
        console.log(res[0]);
        let publicBugMessage = new Discord.MessageEmbed()
        .setAuthor({name: `Bug Report by ${res[0].reporter_tag}`, iconURL: `${user ? user.displayAvatarURL() : interaction.guild.iconURL()}`})
        .setDescription(`${res[0].description}`)
        .setFooter({text: `${interaction.message.embeds[0].footer.text} (ID: ${bugID[1]})`, iconURL: interaction.member.displayAvatarURL()})

        client.channels.cache.get(IC.bugs).send({embeds: [publicBugMessage]}).then(msg => {
          msg.crosspost()
          con.query(`UPDATE reports SET status='APPROVED', reportMessage='${msg.id}' WHERE id='${bugID[1]}'`);
          let dmMsg = new Discord.MessageEmbed()
          .setDescription(`Your bug report was approved! You can check it [here](${msg.url})`)
          try {
            user.send({embeds: [dmMsg]});
          } catch(e){
            console.log(e);
          }
        });
      })
    }
    if(interaction.customId == 'bug-deny'){
      let bugID = interaction.message.embeds[0].footer.text.split(' ');
      let oldEmbed = interaction.message.embeds[0];
      oldEmbed.setFooter({text: `HANDLED BY ${interaction.member.user.tag}`}).setColor("RED").setAuthor({name: `BUG DENIED`, iconURL: interaction.member.displayAvatarURL()})
      con.query(`UPDATE reports SET status='DENIED' WHERE id='${bugID[1]}'`);
      interaction.message.edit({embeds: [oldEmbed], components: []});
      interaction.reply({content: `${emojis.no} You have **denied** bug report successfully!`, ephemeral: true})
    }
  }
}
