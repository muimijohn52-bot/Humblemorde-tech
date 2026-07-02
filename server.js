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

// Store QR code for web display
let currentQR = null;

// QR Code generation
client.on('qr', (qr) => {
  console.log('Scan this QR code to log in:');
  qrcode.generate(qr, { small: true });
  currentQR = qr; // Store QR for web display
});

// Client ready
client.on('ready', () => {
  console.log(`✅ WhatsApp bot is ready - ${new Date().toLocaleString()}`);
  currentQR = null; // Clear QR after login
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

// Web-based QR Code display for pairing
app.get('/qr', (req, res) => {
  if (!currentQR) {
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Humblemorde Tech WhatsApp Bot - QR Login</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 500px;
            animation: slideIn 0.5s ease-out;
          }
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
          }
          .status {
            color: #4CAF50;
            font-size: 16px;
            margin-bottom: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          .status-dot {
            width: 8px;
            height: 8px;
            background: #4CAF50;
            border-radius: 50%;
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .message {
            color: #666;
            margin-bottom: 20px;
            font-size: 14px;
            line-height: 1.6;
          }
          .loader {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .retry-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
            transition: background 0.3s;
          }
          .retry-btn:hover {
            background: #764ba2;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🤖 Humblemorde Tech Bot</h1>
          <div class="status">
            <span class="status-dot"></span>
            <span>Bot is Running</span>
          </div>
          <div class="message">
            ✅ The bot is running and ready to accept connections!
          </div>
          <div class="loader"></div>
          <div class="message">
            Waiting for QR code generation...
          </div>
          <button class="retry-btn" onclick="location.reload()">Refresh</button>
        </div>
      </body>
      </html>
    `);
  }

  res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Humblemorde Tech WhatsApp Bot - QR Login</title>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          text-align: center;
          max-width: 500px;
          animation: slideIn 0.5s ease-out;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        h1 {
          color: #333;
          margin-bottom: 10px;
          font-size: 28px;
        }
        .status {
          color: #4CAF50;
          font-size: 16px;
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          background: #4CAF50;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .instructions {
          color: #666;
          margin: 20px 0;
          font-size: 14px;
          line-height: 1.8;
        }
        .qr-box {
          background: #f9f9f9;
          border: 2px solid #ddd;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          display: inline-block;
        }
        #qrcode {
          animation: fadeIn 0.5s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .steps {
          text-align: left;
          margin: 20px 0;
          background: #f0f7ff;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }
        .steps ol {
          margin-left: 20px;
          color: #555;
        }
        .steps li {
          margin: 8px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📱 WhatsApp Bot Login</h1>
        <div class="status">
          <span class="status-dot"></span>
          <span>Ready for Pairing</span>
        </div>
        
        <div class="instructions">
          Scan the QR code below using WhatsApp on your phone
        </div>
        
        <div class="qr-box">
          <div id="qrcode"></div>
        </div>
        
        <div class="steps">
          <ol>
            <li>Open WhatsApp on your phone</li>
            <li>Go to Settings → Linked Devices</li>
            <li>Tap "Link a device"</li>
            <li>Point your phone at the QR code</li>
          </ol>
        </div>
        
        <div class="instructions" style="color: #999; font-size: 12px; margin-top: 30px;">
          🤖 Humblemorde Tech WhatsApp Bot
        </div>
      </div>
      
      <script>
        new QRCode(document.getElementById("qrcode"), {
          text: "${currentQR}",
          width: 300,
          height: 300,
          colorDark: "#667eea",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H
        });
      </script>
    </body>
    </html>
  `);
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
  console.log(`📱 QR Code available at http://localhost:${PORT}/qr`);
});
