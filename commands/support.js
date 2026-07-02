module.exports = {
  name: 'support',
  description: 'Get support information',
  async execute(client, message, args) {
    const supportText = `
📞 **SUPPORT**

Need help? We're here for you!

📧 Email: support@humblemorde.tech
💬 WhatsApp: +1-XXX-XXX-XXXX
🌐 Website: https://humblemorde.tech
⏰ Support Hours: 24/7

Please describe your issue and we'll get back to you soon.
    `;
    await message.reply(supportText);
  }
};
