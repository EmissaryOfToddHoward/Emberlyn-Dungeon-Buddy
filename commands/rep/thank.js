const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { thanksTable, sequelize } = require("../../utils/loadDb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("thank")
        .setDescription("Thank a player for a job well done.")
        .addUserOption(option =>
            option
                .setName("player")
                .setDescription("Select the player.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("thank_type")
                .setDescription("Specify the type of thanks.")
                .setRequired(true)
                .addChoices(
                    { name: 'mentor', value: 'Mentorship' },
                    { name: 'sociability', value: 'Sociability' }
                )
        ),

    async execute(interaction) {
        const player = interaction.options.getUser("player");

        // ❌ Self-thank check
        /*if (player.id === interaction.user.id) {
            const selfEmbed = new EmbedBuilder()
                .setTitle("🚫 Cannot Thank Yourself")
                .setDescription("You can't thank yourself — share the gratitude with someone else!")
                .setColor(0xff0000);

            return await interaction.reply({ embeds: [selfEmbed] });
        }*/

        const date = new Date();
        const currentDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        console.log(currentDate);

        // Check if the user already thanked the same player today
        let time = await thanksTable.sequelize.query(
            `SELECT createdAt FROM thanksTable WHERE createdAt = "${currentDate}" AND thanker = ${interaction.user.id} AND player = ${player.id}`,
            { type: sequelize.QueryTypes.SELECT }
        );

        if (Object.keys(time).length === 0) {
            await thanksTable.create({
                thanker: interaction.user.id,
                player: player.id,
                thanks_type: interaction.options.getString("thank_type"),
                createdAt: currentDate
            });

            const thankEmbed = new EmbedBuilder()
                .setTitle("✅ Thanks Recorded")
                .setDescription(`You thanked **${player.username}** for **${interaction.options.getString("thank_type")}**.`)
                .setColor(0x00cc66)
                .setTimestamp();

            return await interaction.reply({ embeds: [thankEmbed] });
        } else {
            const alreadyEmbed = new EmbedBuilder()
                .setTitle("⚠️ Already Thanked Today")
                .setDescription(`You've already thanked **${player.username}** today. Try again tomorrow!`)
                .setColor(0xffcc00)
                .setTimestamp();

            return await interaction.reply({ embeds: [alreadyEmbed] });
        }
    }
};
