const { Client, Interaction, PermissionFlagsBits } = require('discord.js');
const AutoRole = require('../../models/AutoRole');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    try {
      await interaction.deferReply();

      if (!(await AutoRole.exists({ guildId: interaction.guild.id }))) {
        interaction.editReply('Auto role wurde nicht eingestellt! Benutze `/autorole-an`');
        return;
      }

      await AutoRole.findOneAndDelete({ guildId: interaction.guild.id });
      interaction.editReply('Auto role wurde ausgeschaltet, Benutze `/autorole-an` um es wieder anzuschalten.');
    } catch (error) {
      console.log(error);
    }
  },

  name: 'autorole-aus',
  description: 'Macht die Auto-Role aus',
  permissionsRequired: [PermissionFlagsBits.Administrator],
};