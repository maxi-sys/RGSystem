const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

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
        content: 'Du kannst den Server Besitzer nicht kicken!',
        ephemeral: true,
      });
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of the target user
    const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of the user running the cmd
    const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot

    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply(
        "Du kannst den Benutzer nicht, kicken, da er die gleiche Rolle hat oder über Dir steht!"
      );
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply(
        "Ich kann den Benutzer nicht, kicken, da er die gleiche Rolle hat oder über mir steht!"
      );
      return;
    }

    // Ban the targetUser
    try {
      const log = client.channels.cache.get('1091116031822540922')
      const embed = new EmbedBuilder()
        .setTitle('❌ Du wurdest gekickt!')
        .setDescription(`**Du wurdest von ${interaction.guild.name} gekickt!\nGrund: ${reason}**\nInvite: https://discord.gg/CycVM6RGgt`)
        .setColor('Aqua')

      await targetUser.send({ embeds: [embed] });
      await targetUser.kick({ reason });
      await log.send(
        `Benutzer ${targetUser} wurde gekickt!\nGrund: ${reason}`
      );
    } catch (error) {
      console.log(`Da ist ein Fehler beim kicken: ${error}`);
    }
  },

  name: 'kick',
  description: 'Kickt einen Benutzer vom Server.',
  options: [
    {
      name: 'benutzer',
      description: 'Den Benutzer den Du kicken möchtest!',
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: 'grund',
      description: 'Wieso möchtest Du den Benutzer kicken?',
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.KickMembers],
  botPermissions: [PermissionFlagsBits.KickMembers],
};