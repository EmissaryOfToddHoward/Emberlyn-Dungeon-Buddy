const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Delete a number of messages from this channel (max 100).")
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("Number of messages to delete (1–100)")
                .setRequired(true)
        ),

    async execute(interaction) {
        const amount = interaction.options.getInteger("amount");
        if (!interaction.member.permissions.has("Administrator")) {
            return await interaction.reply({content: "❌ You don't have permission to use this command.",
            ephemeral: true,});
        } else if (isNaN(amount)) { // Validate the amount
            return await interaction.reply({ 
                content: "❌ That isn't a number.", 
                flags: MessageFlags.Ephemeral 
            });
        } else if (amount <= 0) {
            return await interaction.reply({ 
                content: "❌ Please enter a number greater than 0.", 
                flags: MessageFlags.Ephemeral 
            });
        }else if (amount > 100) {
            return await interaction.reply({ 
                content: "❌ You can only delete up to 100 messages at once.", 
                flags: MessageFlags.Ephemeral 
            });
        }else try {
            const deleted = await interaction.channel.bulkDelete(amount, true);
            await interaction.reply({ 
                content: `✅ Successfully deleted ${deleted.size} message(s).`, 
                flags: MessageFlags.Ephemeral 
            });
        } catch (error) {
            console.error("Error deleting messages:", error);
            await interaction.reply({ 
                content: "❌ An error occurred while trying to delete messages. Make sure I have the correct permissions and that messages aren't older than 14 days.", 
                flags: MessageFlags.Ephemeral 
            });
        }
    },
};
