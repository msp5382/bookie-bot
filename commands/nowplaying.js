const {GuildMember} = require('discord.js');

module.exports = {
  name: 'now-playing',
  description: 'บอกชื่อเพลงที่เล่นอยู่ตอนนี้',
  async execute(interaction, player) {
    if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
      return void interaction.reply({
        content: 'ไม่ได้ฟัง จะอยากรู้ทำไม!',
        ephemeral: true,
      });
    }

    if (
      interaction.guild.me.voice.channelId &&
      interaction.member.voice.channelId !== interaction.guild.me.voice.channelId
    ) {
      return void interaction.reply({
        content: 'ไม่ได้ฟัง จะอยากรู้ทำไม!',
        ephemeral: true,
      });
    }

    await interaction.deferReply();
    const queue = player.getQueue(interaction.guildId);
    if (!queue || !queue.playing)
      return void interaction.followUp({
        content: '❌ | ไม่ได้เล่นเพลง',
      });
    const progress = queue.createProgressBar();
    const perc = queue.getPlayerTimestamp();

    return void interaction.followUp({
      embeds: [
        {
          title: 'เพลงที่กำลังร้อง',
          description: `🎶 | **${queue.current.title}**! (\`${perc.progress}%\`)`,
          fields: [
            {
              name: '\u200b',
              value: progress,
            },
          ],
          color: 0xffffff,
        },
      ],
    });
  },
};
