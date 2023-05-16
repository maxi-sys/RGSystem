module.exports = {
    name: 'ping',
    description: 'Pong!',
    devOnly: true,
    callback: async (client, interaction) => {
        await interaction.deferReply();
        const reply = await interaction.fetchReply();
        const ping = reply.createdTimestamp - interaction.createdTimestamp;
        interaction.editReply(`Pong! Client ${ping}ms | Websocket: ${client.ws.ping}ms`);

    },
};