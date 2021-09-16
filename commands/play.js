const { GuildMember } = require("discord.js");
const { QueryType } = require("discord-player");
const clientID = process.env.SPOTIFY_CLIENT_ID; // clientID from your Spotify app
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET; // clientSecret from your Spotify app
const querystring = require("querystring");
const axios = require("axios");
const renewToken = async () => {
  const authorization = Buffer.from(`${clientID}:${clientSecret}`).toString(
    "base64"
  );
  const { data } = await axios.post(
    "https://accounts.spotify.com/api/token",
    querystring.stringify({
      grant_type: "client_credentials",
    }),
    {
      headers: {
        Authorization: `Basic ${authorization}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return `Bearer ${data.access_token}`;
};

module.exports = {
  name: "play",
  description: "ให้บุ๊คกี้ร้องเพลงเพราะๆให้คุนฟัง",
  options: [
    {
      name: "name",
      type: 3, // 'STRING' Type
      description: "เพลง/เพล์ลิสนั้นชื่อ?",
      required: true,
    },
  ],
  async execute(interaction, player) {
    try {
      if (
        !(interaction.member instanceof GuildMember) ||
        !interaction.member.voice.channel
      ) {
        return void interaction.reply({
          content: "ไม่ได้อยู่ในห้องเสียง!!!",
          ephemeral: true,
        });
      }

      if (
        interaction.guild.me.voice.channelId &&
        interaction.member.voice.channelId !==
          interaction.guild.me.voice.channelId
      ) {
        return void interaction.reply({
          content: "ไม่ได้อยู่ในห้องเสียง!!!",
          ephemeral: true,
        });
      }
      await interaction.deferReply();
      const queue = await player.createQueue(interaction.guild, {
        metadata: interaction.channel,
      });
      const query = interaction.options.get("name").value;
      if (query.includes("open.spotify")) {
        //  return void interaction.followUp({
        //     content: 'กำลังจัดใส่คิว!',
        //     ephemeral: true,
        //   });
        const token = await renewToken();
        const url =
          "https://api.spotify.com/v1/playlists/" +
          query.split("https://open.spotify.com/playlist/")[1];
        const { data } = await axios.get(url, {
          headers: {
            Authorization: token,
          },
        });

        const playlistSearch = data.tracks.items.map(
          (s) => s.track.name + " " + s.track.artists[0].name
        );

        const searchRes = await Promise.all(
          playlistSearch.map((q) => {
            return player.search(q, {
              requestedBy: interaction.user,
              searchEngine: QueryType.AUTO,
            });
          })
        );
        queue.addTracks(searchRes.map((track) => track.tracks[0]));
      } else {
        const searchResult = await player
          .search(query, {
            requestedBy: interaction.user,
            searchEngine: QueryType.AUTO,
          })
          .catch(() => {});
        if (!searchResult || !searchResult.tracks.length)
          return void interaction.followUp({
            content: "เพลงคุณอาจจะอินดี้เกิน หาไม่เจอ",
          });

        try {
          if (!queue.connection)
            await queue.connect(interaction.member.voice.channel);
        } catch {
          void player.deleteQueue(interaction.guildId);
          return void interaction.followUp({
            content: "ไม่มีสิทธิ์เข้าห้องเสียง!!!",
          });
        }
        interaction.reply("กำลังหาเพลง!");
        searchResult.playlist
          ? queue.addTracks(searchResult.tracks)
          : queue.addTrack(searchResult.tracks[0]);
      }
      try {
        if (!queue.connection)
          await queue.connect(interaction.member.voice.channel);
      } catch {
        void player.deleteQueue(interaction.guildId);
        return void interaction.followUp({
          content: "!",
        });
      }
      if (!queue.playing) await queue.play();
    } catch (error) {
      console.log(error);
      interaction.followUp({
        content: "บั๊คโว้ย " + error.message,
      });
    }
  },
};
