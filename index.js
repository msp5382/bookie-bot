const fs = require("fs");
const Discord = require("discord.js");
const Client = require("./client/Client");
const { Player } = require("discord-player");

const client = new Client();
client.commands = new Discord.Collection();

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

console.log(client.commands);

const player = new Player(client);

player.on("error", (queue, error) => {
  console.log(`[${queue.guild.name}] เกิดปัญหาขึ้น: ${error.message}`);
});

player.on("connectionError", (queue, error) => {
  console.log(`[${queue.guild.name}] เกิดปัญหาขึ้น: ${error.message}`);
});

player.on("trackStart", (queue, track) => {
  queue.metadata.send(`🎶 | เล่น **${track.title}**`);
});

player.on("trackAdd", (queue, track) => {
  queue.metadata.send(`🎶 | ใส่ **${track.title}** ลงคิวแร้ว`);
});

player.on("botDisconnect", (queue) => {
  queue.metadata.send("❌ | โดนเตะ เสียใจ;-;");
});

player.on("channelEmpty", (queue) => {
  queue.metadata.send("❌ | ออกกันหมด ออกบ้างค้าบ");
});

player.on("queueEnd", (queue) => {
  queue.metadata.send("✅ | ร้องหมดแร้ว");
});

client.once("ready", async () => {
  console.log("Ready!");
});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;
  if (!client.application?.owner) await client.application?.fetch();

  if (
    message.content === "บุ๊คกี้ ลงคำสั่ง" &&
    message.author.id === client.application?.owner?.id
  ) {
    await message.guild.commands
      .set(client.commands)
      .then(() => {
        message.reply("เรียบร้อย");
      })
      .catch((err) => {
        message.reply(
          "ไม่มีสิทธิ์ ลองดึงบุ๊คกี้อีกครั้งผ่านลิ้ง https://discord.com/api/oauth2/authorize?client_id=852911453858299904&permissions=534727096896&scope=bot%20applications.commands"
        );
        console.error(err);
      });
  }
});

client.on("interactionCreate", async (interaction) => {
  const command = client.commands.get(interaction.commandName.toLowerCase());
  try {
    command.execute(interaction, player);
  } catch (error) {
    console.error(error);
    interaction.followUp({
      content: "There was an error trying to execute that command!",
    });
  }
});

client.login(process.env.TOKEN);
