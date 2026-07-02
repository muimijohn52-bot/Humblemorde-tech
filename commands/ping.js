module.exports = {
  name: 'ping',
  description: 'Check bot response time',
  async execute(client, message, args) {
    const timestamp = Date.now();
    const sentMessage = await message.reply('🏓 Pong!');
    const latency = Date.now() - timestamp;
    await sentMessage.edit(`🏓 Pong! Latency: ${latency}ms`);
  }
};
