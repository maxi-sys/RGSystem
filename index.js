require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');
const mongoose = require('mongoose');
const eventHandler = require('./handlers/eventHandler');
require('@colors/colors');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.MessageContent,
  ],
});

(async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGODB_URI, { keepAlive: false });
    console.log('[MongoDB API] '.green + 'Verbunden mit der Datenbank')
  
    eventHandler(client);  

    client.login(process.env.TOKEN);
  } catch (error) {
    console.log(`Fehler bei der DB: ${error}`);
  }
})();
