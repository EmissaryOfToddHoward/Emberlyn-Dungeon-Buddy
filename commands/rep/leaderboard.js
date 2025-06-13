const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { thanksTable, sequelize } = require("../../utils/loadDb");

const CUSTOM_BANNER_URL = "https://media.discordapp.net/attachments/1208400714531872879/1382751458738442280/Emberlyn_Paper2.png?ex=684c4b26&is=684af9a6&hm=6b4b1ea2c549219791bf1844aa35dad40316e67954cf2fa64323dc6dbe318a0b&=&format=webp&quality=lossless&width=1521&height=856"; // Replace with your banner image URL

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View the top 10 most thanked players."),

  async execute(interaction) {
    const leaderboardData = await thanksTable.sequelize.query(
      `SELECT player, COUNT(*) as total FROM thanksTable GROUP BY player ORDER BY total DESC LIMIT 10`,
      { type: sequelize.QueryTypes.SELECT }
    );

    if (leaderboardData.length === 0) {
      return await interaction.reply({
        content: "No thanks data found yet.",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("🏆 Thanks Leaderboard")
      .setDescription("Top 10 most thanked players")
      .setColor(0xFFD700)
      .setImage(CUSTOM_BANNER_URL)  // Banner image here
      .setTimestamp();

    for (let i = 0; i < leaderboardData.length; i++) {
      const entry = leaderboardData[i];
      const userId = entry.player;
      const totalThanks = entry.total;

      try {
        const user = await interaction.client.users.fetch(userId);
        embed.addFields({
          name: `#${i + 1} ${user.username}`,
          value: `Thanks: **${totalThanks}**`,
          inline: false,
        });
      } catch (err) {
        embed.addFields({
          name: `#${i + 1} Unknown User (${userId})`,
          value: `Thanks: **${totalThanks}**`,
          inline: false,
        });
      }
    }

    await interaction.reply({ embeds: [embed] });
  },
};
