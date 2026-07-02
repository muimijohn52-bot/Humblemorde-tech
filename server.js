const express = require('express');
const dotenv = require('dotenv');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const messageHandler = require('./handlers/messageHandler');
const commandHandler = require('./handlers/commandHandler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize WhatsApp client
const client = new Client();

// QR Code generation
client.on('qr', (qr) => {
  console.log('Scan this QR code to log in:');
  qrcode.generate(qr, { small: true });
});

// Client ready
client.on('ready', () => {
  console.log(`✅ WhatsApp bot is ready - ${new Date().toLocaleString()}`);
});

// Handle incoming messages
client.on('message', async (message) => {
  try {
    if (message.body.startsWith(process.env.BOT_PREFIX || '!')) {
      await commandHandler.handle(client, message);
    } else {
      await messageHandler.handle(client, message);
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
});

// Error handling
client.on('error', (error) => {
  console.error('Client error:', error);
});

// Initialize client
client.initialize();

// Express routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Bot is running' });
});

app.post('/api/send-message', async (req, res) => {
  try {
    const { number, message } = req.body;
    await client.sendMessage(`${number}@c.us`, message);
    res.status(200).json({ success: true, message: 'Message sent' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
