module.exports = {
  name: 'info',
  description: 'Get bot information',
  async execute(client, message, args) {
    const infoText = `
🤖 **BOT INFORMATION**

Bot Name: Humblemorde Tech Bot
Version: 1.0.0
Status: ✅ Online
Platform: WhatsApp

This bot provides automated responses and command handling for Humblemorde Tech.
    `;
    await message.reply(infoText);
  }
};
