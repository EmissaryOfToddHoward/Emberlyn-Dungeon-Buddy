const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { thanksTable, sequelize } = require("../../utils/loadDb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("checkthanks")
        .setDescription("Check a player's thanks.")
        .addUserOption(option =>
            option
                .setName("player")
                .setDescription("Select the player.")
        ),

    async execute(interaction) {
        //Uses specified user unless left blank then default to command user
        const player = interaction.options.getUser("player") || interaction.user;

        /*
        Use parameterized queries for safety
        Collects a total COUNT for both Sociability Rep and Mentorship Rep then parses those into integar format
        And calculates the total of both added together then displays these metrics in a embed
        */
        const socialResult = await thanksTable.sequelize.query(
            `SELECT COUNT(*) AS count FROM thanksTable WHERE player = :playerId AND thanks_type = "Sociability"`,
            {
                replacements: { playerId: player.id },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        const mentorResult = await thanksTable.sequelize.query(
            `SELECT COUNT(*) AS count FROM thanksTable WHERE player = :playerId AND thanks_type = "Mentorship"`,
            {
                replacements: { playerId: player.id },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        const socialCount = parseInt(socialResult[0].count);
        const mentorCount = parseInt(mentorResult[0].count);
        const totalCount = socialCount + mentorCount;

        const embed = new EmbedBuilder()
            .setTitle(`Thanks Report for ${player.username}`)
            .setColor(0x00AE86)
            .addFields(
                { name: "Sociability Thanks", value: `${socialCount}`, inline: true },
                { name: "Mentorship Thanks", value: `${mentorCount}`, inline: true },
                { name: "Total Thanks", value: `${totalCount}`, inline: true }
            )
            .setThumbnail(player.displayAvatarURL())
            .setTimestamp();

        if (totalCount === 0) {
            embed.setDescription(`${player} has not yet received any thanks.`);
        }

        await interaction.reply({ embeds: [embed] });
    },
};
