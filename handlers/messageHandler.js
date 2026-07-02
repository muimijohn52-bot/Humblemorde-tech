/**
 * Handle regular messages (non-command)
 */

const messageHandler = {
  async handle(client, message) {
    console.log(`📨 Message from ${message.from}: ${message.body}`);

    if (message.body.toLowerCase().includes('hello')) {
      await message.reply('👋 Hello! Welcome to Humblemorde Tech Bot. Type !help for available commands.');
    }

    if (message.body.toLowerCase().includes('help')) {
      const helpMessage = `
📚 **HELP MENU**

Available commands:
!help - Show this help menu
!info - Get bot information
!ping - Check bot response
!about - About Humblemorde Tech
!support - Contact support
      `;
      await message.reply(helpMessage);
    }
  }
};

module.exports = messageHandler;
