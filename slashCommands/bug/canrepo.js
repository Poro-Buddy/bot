const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const emb = require("../../botconfig/embed.json");
const IC = require('../../botconfig/internalChannels.json')
const moment = require('moment');
var con = require("../../db.js");
const emojis = require("../../botconfig/emojis.json");
const ms = require("ms");
//var db = require("../../db.js");
module.exports = {
  name: "canrepo", //the command name for the Slash Command
  description: "Inform Poro Buddy team that you can repo the bug", //the command description for Slash Command Overview
  cooldown: 1,
  memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  allowedGuilds: ['959950191304253561'],
  options: [ 
      	{"Integer": { name: "bug_id", description: "Write down the bug ID, you can reproduce", required: true }}, //to use in the code: interacton.getString("ping_amount")
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

            let bugID = options.getInteger("bug_id");
            
            con.query(`SELECT * FROM reports WHERE id='${bugID}'`, function (error, res){
                if(res.length > 0){
                    let bugChannel = interaction.guild.channels.cache.get(IC.bugs);
                    let bugMsg = bugChannel.messages.fetch(res[0].reportMessage).then(value => console.log(value));
                }
            })

        } catch (e) {
            console.log(String(e.stack).bgRed)
        }
    }
}

function chance(){
    return Math.floor(Math.random() * 2) +1;
}