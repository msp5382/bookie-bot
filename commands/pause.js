const {GuildMember} = require('discord.js');

module.exports = {
  name: 'stop',
  description: 'หยุดร้องเพลง;-;',
  async execute(interaction, player) {
    if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
      return void interaction.reply({
        content: 'ไม่ได้อยู่ในห้องเสียง!!!',
        ephemeral: true,
      });
    }

    if (
      interaction.guild.me.voice.channelId &&
      interaction.member.voice.channelId !== interaction.guild.me.voice.channelId
    ) {
      return void interaction.reply({
        content: 'ไม่ได้อยู่ในห้องเสียง!!!',
        ephemeral: true,
      });
    }

    await interaction.deferReply();
    const queue = player.getQueue(interaction.guildId);
    if (!queue || !queue.playing)
      return void interaction.followUp({
        content: '❌ | ไม่ได้ร้องเพลงอยู่',
      });
    const success = queue.setPaused(true);
    return void interaction.followUp({
      content: success ? '⏸ | หยุดร้องแร้ว' : '❌ | เกิดปัญหาขึ้น ชหละ',
    });
  },
};
