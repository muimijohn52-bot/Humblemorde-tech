/**
 * Handle command messages (starting with prefix)
 */

const commands = require('../commands');

const commandHandler = {
  async handle(client, message) {
    const prefix = process.env.BOT_PREFIX || '!';
    const args = message.body.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    console.log(`⚙️ Command: ${commandName} | Args:`, args);

    const command = commands[commandName];

    if (!command) {
      await message.reply('❌ Command not found. Type !help for available commands.');
      return;
    }

    try {
      await command.execute(client, message, args);
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error);
      await message.reply('❌ An error occurred while executing the command.');
    }
  }
};

module.exports = commandHandler;
