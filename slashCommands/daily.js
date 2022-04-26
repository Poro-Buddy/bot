const { MessageEmbed } = require("discord.js");
const emb = require("../botconfig/embed.json");
const db = require('quick.db');
const moment = require('moment');
var con = require("../db.js");
const emojis = require("../botconfig/emojis.json");
const ms = require("ms");
//var db = require("../../db.js");
module.exports = {
  name: "daily", //the command name for the Slash Command
  description: "Claim your daily from Poro!", //the command description for Slash Command Overview
  cooldown: 1,
  memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [ 
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
            let lastDaily = await db.get(`dailyCD_${member.id}`);
            console.log(lastDaily);
            const cooldown = 86400000;

            let capsules = chance();
            let rewards = `**+ 1000** ${emojis.blue}\n**+ 100** ${emojis.rp}\n**+ ${capsules}** ${emojis.capsule}`

            if (lastDaily !== null && cooldown - (Date.now() - lastDaily) > 0) {
                let cooldownRemaining = ms(cooldown - (Date.now() - lastDaily))
                const claimedAlready = new MessageEmbed()
                .setImage(`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/summoner-backdrops/4903.jpg`)
                .setColor("RED")
                .setFooter(emb.footertext)
                .setTitle(`YOU HAVE CLAIMED YOUR DAILY ALREADY!`)
                .setDescription(`You have claimed your daily already, and you need to wait **${cooldownRemaining}** before Poro is ready to give you some more!`)

                interaction.reply({embeds: [claimedAlready], ephemeral: true});
            } else {
                const claimed = new MessageEmbed()
                .setImage(`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/summoner-backdrops/4571.jpg`)
                .setColor("RANDOM")
                .setTitle(`YOU HAVE CLAIMED YOUR DAILY REWARD!`)
                .setTimestamp()
                .setFooter(emb.footertext)
                .setDescription(`${member} claimed following rewards to their account\n${rewards}`);

                db.set(`dailyCD_${member.id}`, Date.now());
                interaction.reply({embeds: [claimed]});
                con.query(`SELECT * FROM game_user WHERE id='${member.id}'`, function (err, res){
                    if(res.length > 0){
                        con.query(`UPDATE game_user SET rp = rp + 100, blue = blue + 1000, capsules = capsules + ${capsules} WHERE id='${member.id}'`)
                    } else {
                        con.query(`INSERT INTO game_user (id, rp, blue, capsules) VALUES ('${member.id}', '100', '1000', '${capsules}')`)
                    }
                })
            }
        } catch (e) {
            console.log(String(e.stack).bgRed)
        }
    }
}

function chance(){
    return Math.floor(Math.random() * 2) +1;
}