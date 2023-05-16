const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */

  callback: async (client, interaction) => {
    const targetUserId = interaction.options.get('benutzer').value;
    const reason = interaction.options.get('grund')?.value || 'Kein Grund!';

    await interaction.deferReply();

    const targetUser = await interaction.guild.members.fetch(targetUserId);

    if (!targetUser) {
      await interaction.editReply("Dieser Benutzer existiert nicht!");
      return;
    }

    if (targetUser.id === interaction.guild.ownerId) {
      await interaction.editReply({
        content: 'Du kannst den Server Besitzer nicht sperren!',
        ephemeral: true,
      });
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of the target user
    const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of the user running the cmd
    const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot

    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply({
        content:
          "Du kannst den Benutzer nicht, sperren, da er die gleiche Rolle hat oder über Dir steht!", ehemeral: true,
      });
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply({
        content:
          "Ich kann den Benutzer nicht, sperren, da er die gleiche Rolle hat oder über mir steht!", ehemeral: true,
      });
      return;
    }

    // Ban the targetUser
    try {
      await targetUser.ban({ reason });
      await interaction.editReply(
        `Benutzer ${targetUser} wurde gesperrt!\nGrund: ${reason}`
      );
    } catch (error) {
      console.log(`Da ist ein Fehler beim Sperren: ${error}`);
    }
  },

  name: 'ban',
  description: 'Sperrt einen Benutzer vom Server.',
  options: [
    {
      name: 'benutzer',
      description: 'Den Benutzer den Du Sperren möchtest!',
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: 'grund',
      description: 'Wieso möchtest Du den Benutzer sperren?',
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.BanMembers],
  botPermissions: [PermissionFlagsBits.BanMembers],
};