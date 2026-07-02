const express = require('express');
const dotenv = require('dotenv');
const makeWASocket = require('@whiskeysockets/baileys').default;
const {
  useMultiFileAuthState,
  Browsers,
  MessageRetryMap,
  DisconnectReason
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const pairingHandler = require('./pairing-handler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Logger
const logger = pino();

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// State for WhatsApp connection
let sock = null;
let currentQR = null;
let pairingCode = null;
let isConnected = false;

/**
 * Initialize WhatsApp Socket with Baileys
 */
async function initializeSocket() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    sock = makeWASocket({
      auth: state,
      browser: Browsers.ubuntu('ChromeOS'),
      logger: logger,
      printQRInTerminal: true,
      retryRequestDelayMs: 6000,
      msgRetryCounterMax: 15,
      shouldIgnoreJid: (jid) => {
        return !jid || (jid !== 'status@broadcast' && !jid.endsWith('@g.us'));
      }
    });

    // Update credentials when they change
    sock.ev.on('creds.update', saveCreds);

    // Handle connection updates
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, isNewLogin, qr } = update;

      // QR Code generation
      if (qr) {
        currentQR = qr;
        console.log('📱 New QR code generated - scan to login');
      }

      if (connection === 'open') {
        isConnected = true;
        currentQR = null;
        pairingCode = null;
        console.log('✅ WhatsApp connection opened');
      }

      if (connection === 'close') {
        isConnected = false;
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

        if (shouldReconnect) {
          console.log('🔄 Attempting to reconnect...');
          setTimeout(() => initializeSocket(), 3000);
        } else {
          console.log('❌ Logged out. Please login again.');
          currentQR = null;
          pairingCode = null;
        }
      }

      if (isNewLogin) {
        console.log('🎉 New login detected');
      }
    });

    // Handle incoming messages
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      for (const message of messages) {
        if (!message.key.fromMe && message.message) {
          console.log(`📨 Message from ${message.key.remoteJid}: ${message.message.conversation || message.message.extendedTextMessage?.text || '[Media/Other]'}`);
          // Add your message handling logic here
        }
      }
    });

  } catch (error) {
    logger.error(`Error initializing socket: ${error.message}`);
    setTimeout(() => initializeSocket(), 5000);
  }
}

// Initialize socket on startup
initializeSocket();

// ==================== ROUTES ====================

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'Bot is running',
    connected: isConnected,
    timestamp: new Date().toISOString()
  });
});

// ==================== QR CODE ROUTES ====================

// Display QR Code (old method)
app.get('/qr', (req, res) => {
  if (!currentQR && isConnected) {
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Humblemorde Tech WhatsApp Bot</title>
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
          }
          h1 { color: #333; margin-bottom: 10px; }
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
          .message { color: #666; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🤖 Humblemorde Tech Bot</h1>
          <div class="status">
            <span class="status-dot"></span>
            <span>✅ Already Connected</span>
          </div>
          <p class="message">Your WhatsApp bot is already connected and ready!</p>
          <p class="message">🔗 Use pairing code method or manage sessions from the dashboard.</p>
        </div>
      </body>
      </html>
    `);
  }

  if (!currentQR) {
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Humblemorde Tech WhatsApp Bot</title>
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
          }
          h1 { color: #333; margin-bottom: 10px; }
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
          .message { color: #666; margin-bottom: 20px; }
          .retry-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
          }
          .retry-btn:hover { background: #764ba2; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🤖 Humblemorde Tech Bot</h1>
          <div class="loader"></div>
          <p class="message">Generating QR code...</p>
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
        }
        h1 { color: #333; margin-bottom: 10px; font-size: 28px; }
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
        .instructions { color: #666; margin: 20px 0; font-size: 14px; }
        .qr-box {
          background: #f9f9f9;
          border: 2px solid #ddd;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          display: inline-block;
        }
        .steps {
          text-align: left;
          margin: 20px 0;
          background: #f0f7ff;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }
        .steps ol { margin-left: 20px; color: #555; }
        .steps li { margin: 8px 0; }
        .alternative-link {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        .alternative-link a {
          color: #667eea;
          text-decoration: none;
          font-weight: bold;
        }
        .alternative-link a:hover { text-decoration: underline; }
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

        <div class="alternative-link">
          <p style="color: #999; font-size: 12px; margin-bottom: 10px;">Or use an 8-digit pairing code:</p>
          <a href="/pairing">Use Pairing Code Instead →</a>
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

// ==================== PAIRING CODE ROUTES ====================

// Display pairing code page
app.get('/pairing', (req, res) => {
  if (isConnected) {
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Humblemorde Tech WhatsApp Bot</title>
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
          }
          h1 { color: #333; margin-bottom: 10px; }
          .status { color: #4CAF50; font-size: 16px; margin-bottom: 30px; }
          .message { color: #666; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✅ Already Connected</h1>
          <p class="message">Your WhatsApp bot is already connected and authenticated!</p>
          <p class="message">No pairing needed at this time.</p>
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
      <title>Humblemorde Tech WhatsApp Bot - 8-Digit Pairing Code</title>
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
        }
        h1 { color: #333; margin-bottom: 10px; font-size: 28px; }
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
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .instructions { color: #666; margin: 20px 0; font-size: 14px; line-height: 1.6; }
        .input-group { margin: 20px 0; }
        input {
          width: 100%;
          padding: 12px;
          font-size: 16px;
          border: 2px solid #ddd;
          border-radius: 8px;
          box-sizing: border-box;
          margin-bottom: 10px;
        }
        input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          margin-top: 10px;
          transition: background 0.3s;
        }
        .btn:hover { background: #764ba2; }
        .btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .code-box {
          background: #f0f7ff;
          border: 2px solid #667eea;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          display: none;
        }
        .code-box.show { display: block; }
        .code-display {
          font-size: 48px;
          font-weight: bold;
          color: #667eea;
          letter-spacing: 10px;
          font-family: 'Courier New', monospace;
          margin: 20px 0;
        }
        .timer {
          color: #FF9800;
          font-weight: bold;
          margin-top: 10px;
        }
        .copy-btn {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          margin-top: 10px;
        }
        .copy-btn:hover { background: #45a049; }
        .steps {
          text-align: left;
          margin: 20px 0;
          background: #f9f9f9;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }
        .steps ol { margin-left: 20px; color: #555; }
        .steps li { margin: 8px 0; font-size: 13px; }
        .error { color: #F44336; display: none; margin-top: 10px; }
        .success { color: #4CAF50; display: none; margin-top: 10px; }
        .alternative-link {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        .alternative-link a {
          color: #667eea;
          text-decoration: none;
          font-weight: bold;
          font-size: 14px;
        }
        .alternative-link a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔐 WhatsApp Pairing Code</h1>
        <div class="status">
          <span class="status-dot"></span>
          <span>Ready for Pairing</span>
        </div>
        
        <div class="instructions">
          Enter your phone number to generate an 8-digit pairing code
        </div>

        <div class="input-group">
          <input 
            type="tel" 
            id="phoneInput" 
            placeholder="Enter your phone number (e.g., 254712345678)" 
            autocomplete="off"
          />
          <button class="btn" onclick="generateCode()">Generate Pairing Code</button>
          <div class="error" id="errorMsg"></div>
          <div class="success" id="successMsg"></div>
        </div>

        <div class="code-box" id="codeBox">
          <p style="color: #666; margin-bottom: 10px;">Your 8-Digit Pairing Code:</p>
          <div class="code-display" id="codeDisplay">------ -- </div>
          <p class="timer">Expires in: <span id="timer">300</span>s</p>
          <button class="copy-btn" onclick="copyCode()">📋 Copy Code</button>
        </div>

        <div class="steps" id="stepsBox" style="display: none;">
          <p style="color: #333; margin-bottom: 10px; font-weight: bold;">Steps to Link Device:</p>
          <ol>
            <li>Open WhatsApp on your phone</li>
            <li>Go to <strong>Settings → Devices → Link a device</strong></li>
            <li>Tap <strong>"Link with phone number"</strong></li>
            <li>Enter the 8-digit code shown above</li>
            <li>Confirm the pairing</li>
          </ol>
        </div>

        <div class="alternative-link">
          <p style="color: #999; font-size: 12px; margin-bottom: 10px;">Prefer QR code?</p>
          <a href="/qr">Use QR Code Instead →</a>
        </div>
        
        <div class="instructions" style="color: #999; font-size: 12px; margin-top: 30px;">
          🤖 Humblemorde Tech WhatsApp Bot
        </div>
      </div>

      <script>
        let countdownInterval;
        
        async function generateCode() {
          const phone = document.getElementById('phoneInput').value.trim();
          const errorMsg = document.getElementById('errorMsg');
          const successMsg = document.getElementById('successMsg');
          const btn = event.target;

          errorMsg.style.display = 'none';
          successMsg.style.display = 'none';

          if (!phone) {
            errorMsg.textContent = 'Please enter a phone number';
            errorMsg.style.display = 'block';
            return;
          }

          btn.disabled = true;
          btn.textContent = 'Generating...';

          try {
            const response = await fetch('/api/generate-pairing-code', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phoneNumber: phone })
            });

            const data = await response.json();

            if (data.success) {
              document.getElementById('codeDisplay').textContent = formatCode(data.pairingCode);
              document.getElementById('codeBox').classList.add('show');
              document.getElementById('stepsBox').style.display = 'block';
              successMsg.textContent = 'Pairing code generated! Valid for 5 minutes.';
              successMsg.style.display = 'block';
              
              startCountdown(data.expiresIn);
            } else {
              errorMsg.textContent = data.error || 'Failed to generate code';
              errorMsg.style.display = 'block';
            }
          } catch (error) {
            errorMsg.textContent = 'Error: ' + error.message;
            errorMsg.style.display = 'block';
          } finally {
            btn.disabled = false;
            btn.textContent = 'Generate Pairing Code';
          }
        }

        function formatCode(code) {
          return code.slice(0, 4) + ' ' + code.slice(4);
        }

        function startCountdown(seconds) {
          let remaining = seconds;
          clearInterval(countdownInterval);
          
          countdownInterval = setInterval(() => {
            document.getElementById('timer').textContent = remaining;
            remaining--;
            
            if (remaining < 0) {
              clearInterval(countdownInterval);
              document.getElementById('codeBox').classList.remove('show');
              document.getElementById('stepsBox').style.display = 'none';
              document.getElementById('phoneInput').value = '';
            }
          }, 1000);
        }

        function copyCode() {
          const code = document.getElementById('codeDisplay').textContent.replace(' ', '');
          navigator.clipboard.writeText(code).then(() => {
            const btn = event.target;
            const originalText = btn.textContent;
            btn.textContent = '✓ Copied!';
            setTimeout(() => {
              btn.textContent = originalText;
            }, 2000);
          });
        }
      </script>
    </body>
    </html>
  `);
});

// API: Generate pairing code
app.post('/api/generate-pairing-code', (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    const result = pairingHandler.generatePairingCode(phoneNumber);
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Error in generate pairing code: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API: Validate pairing code
app.post('/api/validate-pairing-code', (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        valid: false,
        message: 'Pairing code is required'
      });
    }

    const result = pairingHandler.validatePairingCode(code);
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Error in validate pairing code: ${error.message}`);
    res.status(500).json({
      valid: false,
      error: error.message
    });
  }
});

// API: Get active pairing codes (admin)
app.get('/api/admin/active-codes', (req, res) => {
  try {
    const codes = pairingHandler.getActiveCodes();
    res.status(200).json({
      success: true,
      count: codes.length,
      codes: codes
    });
  } catch (error) {
    logger.error(`Error fetching active codes: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API: Revoke pairing code
app.post('/api/admin/revoke-code', (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code is required'
      });
    }

    const revoked = pairingHandler.revokePairingCode(code);
    res.status(200).json({
      success: revoked,
      message: revoked ? 'Code revoked' : 'Code not found'
    });
  } catch (error) {
    logger.error(`Error revoking code: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== MESSAGE API ====================

// Send message
app.post('/api/send-message', async (req, res) => {
  try {
    if (!sock || !isConnected) {
      return res.status(400).json({
        success: false,
        error: 'Bot not connected'
      });
    }

    const { number, message } = req.body;

    if (!number || !message) {
      return res.status(400).json({
        success: false,
        error: 'Number and message are required'
      });
    }

    const chatId = number.includes('@') ? number : `${number}@c.us`;
    await sock.sendMessage(chatId, { text: message });

    res.status(200).json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    logger.error(`Error sending message: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 QR Code available at http://localhost:${PORT}/qr`);
  console.log(`🔐 Pairing Code available at http://localhost:${PORT}/pairing`);
  console.log(`💚 Health check at http://localhost:${PORT}/health`);
});
