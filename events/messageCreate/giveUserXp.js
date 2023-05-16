const { Client, Message } = require('discord.js');
const Level = require('../../models/Level');
const calculateLevelXp = require('../../utils/calculateLevelXp');
const cooldowns = new Set();

function getRandomXp(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 
 * @param {Client} client 
 * @param {Message} message 
 */

module.exports = async (client, message) => {
    if (!message.inGuild() || message.author.bot || cooldowns.has(message.author.id)) return;

    const xpToGive = getRandomXp(5, 15);

    const query = {
        userId: message.author.id,
        guildId: message.guild.id,
    };

    try {
        const level = await Level.findOne(query);

        if (level) {
            level.xp += xpToGive;

            if (level.xp > calculateLevelXp(level.level)) {
                level.xp = 0;
                level.level += 1;

                message.channel.send(`${message.member} Level UP! **level ${level.level}**.`);
            }

            await level.save().catch((e) => {
                console.log(`Fehler beim speichern vom leveln ${e}`);
                return;
            });
            cooldowns.add(message.author.id);
            setTimeout(() => {
                cooldowns.delete(message.author.id);
            }, 60000);
        }

        else {
            const newLevel = new Level({
                userId: message.author.id,
                guildId: message.guild.id,
                xp: xpToGive,
                });

                await newLevel.save();
                cooldowns.add(message.author.id);
                setTimeout(() => {
                cooldowns.delete(message.author.id);
                }, 60000);
        }
    } catch (error) {
        console.log(`Fehler beim geben von xp: ${error}`);
    }
}