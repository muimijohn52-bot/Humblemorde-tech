module.exports = {
  name: 'about',
  description: 'Information about Humblemorde Tech',
  async execute(client, message, args) {
    const aboutText = `
🏢 **ABOUT HUMBLEMORDE TECH**

Welcome to Humblemorde Tech!

We provide cutting-edge technology solutions and gaming services.

For more information, visit our website or contact support.

Thank you for using our service!
    `;
    await message.reply(aboutText);
  }
};
