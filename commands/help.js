module.exports = {
  name: 'help',
  description: 'Shows available commands',
  async execute(client, message, args) {
    const helpText = `
📚 **HUMBLEMORDE BOT - HELP MENU**

**Available Commands:**
!help - Display this help menu
!info - Get bot information
!ping - Test bot response time
!about - Learn about Humblemorde Tech
!support - Get support information

**Usage:**
Type a command with the ! prefix
Example: !ping

**Need more help?**
Contact support: !support
    `;
    await message.reply(helpText);
  }
};
