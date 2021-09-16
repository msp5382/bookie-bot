const { GuildMember } = require('discord.js');
const { QueryType } = require('discord-player');

module.exports = {
  name: 'queue',
  description: 'ดูคิวเพลง',
  async execute(interaction, player) {
    await interaction.deferReply();
    const q = player.createQueue(interaction.guild, {
      metadata: interaction.channel,
    });
    console.log(q.tracks)
    console.log(q.tracks.map(t => "`" + t.title + "`\n").join(''))
    if (q.tracks.length > 0) {
      await interaction.followUp({
        content: (q.tracks.map((t,i) => (i+1)+". `" + t.title + "`\n").join('')).slice(0,1900)+"...."
      });
    } else {
      await interaction.followUp({
        content: "คิวว่างเปล่าาา",
      });
    }

  },
};
