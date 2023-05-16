const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const ms = require('ms');

module.exports = {
    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */

    callback: async (client, interaction) => {
        const mentionable = interaction.options.get('benutzer').value;
        const duration = interaction.options.get('zeitraum').value;
        const reason = interaction.options.get('grund')?.value || "Kein Grund";

        await interaction.deferReply();

        const targetUser = await interaction.guild.members.fetch(mentionable);
        if (!targetUser) {
            await interaction.editReply('Dieser Benutzer exestiert nicht!');
            return;
        }

        if (targetUser.user.bot) {
            await interaction.editReply('Ich kann kein Bot timeouten!');
            return;
        }

        const msDuration = ms(duration);
        if (isNaN(msDuration)) {
            await interaction.editReply('Bitte gebe ein Zeitraum an!');
            return;
        }

        if (msDuration < 5000 || msDuration > 2.419e9) {
            await interaction.editReply('Timeout Zeitraum kann nicht unter 5 Sekunden sein oder über 28 Tage!');
            return;
        }

        const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of the target user
        const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of the user running the cmd
        const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot

        if (targetUserRolePosition >= requestUserRolePosition) {
            await interaction.editReply(
                "Du kannst den Benutzer nicht, timeouten, da er die gleiche Rolle hat oder über Dir steht!"
            );
            return;
        }

        if (targetUserRolePosition >= botRolePosition) {
            await interaction.editReply(
                "Ich kann den Benutzer nicht, timeouten, da er die gleiche Rolle hat oder über mir steht!"
            );
            return;
        }

        try {
            const { default: prettyMs } = await import('pretty-ms');

            if (targetUser.isCommunicationDisabled()) {
                await targetUser.timeout(msDuration, reason);
                await interaction.editReply(`${targetUser}'s timeout wurde verlängert auf ${prettyMs(msDuration, { verbose: true })}\nGrund: ${reason}`);
                return;
            }
            // test
            await targetUser.timeout(msDuration, reason);
            await interaction.editReply(`${targetUser} wurde getimeoutet für ${prettyMs(msDuration, { verbose: true })}.\nGrund: ${reason}`)
        } catch (error) {
            console.log(`Da war ein Fehler beim Timeouten: ${error}`)
        }
    },


    name: 'timeout',
    description: 'Timeout ein Benutzer',
    options: [
        {
            name: 'benutzer',
            description: 'Den Benutzer den du Timeouten möchtest',
            type: ApplicationCommandOptionType.Mentionable,
            required: true,
        },
        {
            name: 'zeitraum',
            description: 'Timeout Dauer (30m, 1h, 1d).',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'grund',
            description: 'Die Grund für den Timeout',
            type: ApplicationCommandOptionType.String,
        }
    ],
    permissionsRequired: [PermissionFlagsBits.MuteMembers],
    botPermissions: [PermissionFlagsBits.MuteMembers],
}