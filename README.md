# 🤖 Humblemorde Tech WhatsApp Bot

```
  ╔═══════════════════════════════════════════════════╗
  ║                                                   ║
  ║     🤖 HUMBLEMORDE TECH WHATSAPP BOT 🤖          ║
  ║                                                   ║
  ║  Automated WhatsApp messaging & command system   ║
  ║                                                   ║
  ╚═══════════════════════════════════════════════════╝
```

> A powerful WhatsApp bot for Humblemorde Tech with command handling, automated responses, and web-based QR code pairing.

---

## ✨ Features

- ✅ **WhatsApp Integration** - Full WhatsApp Web integration
- 📱 **Web-based QR Pairing** - Scan QR code from browser at `/qr`
- 📝 **Command System** - Prefix-based commands with easy extension
- 🔧 **Message Handling** - Automated message routing and responses
- 📊 **Bot Information** - Help menu and bot status
- 🚀 **Express Server** - RESTful API endpoints
- 🎯 **Easy to Extend** - Simple command and handler structure
- ☁️ **Cloud Ready** - Pre-configured for Heroku, Render, and Railway

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v14 or higher
- **npm** or **yarn**
- **WhatsApp** account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/muimijohn52-bot/Humblemorde-tech.git
   cd Humblemorde-tech
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure your WhatsApp credentials** in `.env`
   ```bash
   # .env
   BOT_PREFIX=!
   PORT=3000
   NODE_ENV=development
   ```

5. **Start the bot**
   ```bash
   npm start
   ```

6. **Access QR Code Pairing**
   - Open your browser: `http://localhost:3000/qr`
   - Scan the QR code with your WhatsApp mobile app
   - Bot will authenticate automatically

### Development Mode

For auto-reload during development:
```bash
npm run dev
```

---

## 📱 QR Code Pairing

### Web-Based Pairing Interface

The bot provides a beautiful web interface for scanning the WhatsApp QR code:

```
Visit: http://localhost:3000/qr
```

**Features:**
- ✨ Modern animated UI
- 📱 Mobile responsive design
- 🔄 Real-time QR code generation
- 🌐 Works on any browser
- 📊 Status indicator

**Steps:**
1. Navigate to the `/qr` endpoint
2. Open WhatsApp on your phone
3. Go to **Settings → Linked Devices**
4. Tap **"Link a device"**
5. Scan the QR code displayed
6. Bot automatically connects

---

## 🎮 Commands

The bot responds to prefixed commands (default: `!`):

| Command | Description | Example |
|---------|-------------|---------|
| `!help` | Show help menu | `!help` |
| `!info` | Bot information | `!info` |
| `!ping` | Check response time | `!ping` |
| `!about` | About Humblemorde Tech | `!about` |
| `!support` | Support information | `!support` |

---

## 🌐 API Endpoints

### Health Check
Check if bot is running:
```bash
GET /health
```

**Response:**
```json
{
  "status": "Bot is running"
}
```

### Send Message
Send a message via the bot:
```bash
POST /api/send-message
Content-Type: application/json

{
  "number": "1234567890",
  "message": "Hello from Humblemorde!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent"
}
```

### QR Code Pairing
Web-based QR code pairing interface:
```bash
GET /qr
```

---

## 📁 Project Structure

```
├── server.js                 # Main bot server & Express app
├── package.json              # Dependencies
├── .env.example              # Environment template
├── .dockerignore             # Docker ignore rules
├── Procfile                  # Heroku deployment
├── render.yaml               # Render deployment
├── railway.json              # Railway deployment
├── handlers/
│   ├── messageHandler.js     # Regular message handling
│   └── commandHandler.js     # Command execution
├── commands/
│   ├── index.js              # Command registry
│   ├── help.js               # Help command
│   ├── info.js               # Info command
│   ├── ping.js               # Ping command
│   ├── about.js              # About command
│   └── support.js            # Support command
├── DEPLOYMENT.md             # Cloud deployment guide
└── README.md                 # This file
```

---

## ☁️ Cloud Deployment

### Supported Platforms

Deploy to your favorite cloud platform with pre-configured files:

#### **Heroku**
```bash
heroku login
heroku create your-app-name
git push heroku main
```
📖 [Full Heroku Guide](DEPLOYMENT.md#heroku)

#### **Render**
```bash
# Connect GitHub repo in Render Dashboard
# Auto-deploys on push
```
📖 [Full Render Guide](DEPLOYMENT.md#render)

#### **Railway**
```bash
railway link
railway up
```
📖 [Full Railway Guide](DEPLOYMENT.md#railway)

### Environment Variables

Set these on your hosting platform:

```bash
PORT=3000
NODE_ENV=production
BOT_PREFIX=!
```

📖 [Complete Deployment Guide](DEPLOYMENT.md)

---

## 🛠️ Configuration

### Environment Variables

Create a `.env` file with:

```bash
# Server
PORT=3000
NODE_ENV=development

# Bot Settings
BOT_PREFIX=!

# WhatsApp (if needed)
WHATSAPP_SESSION=your_session_key
```

### Custom Commands

Add new commands in `commands/` directory:

```javascript
// commands/hello.js
module.exports = {
  name: 'hello',
  description: 'Say hello',
  execute: async (client, message, args) => {
    await message.reply('Hello! 👋');
  }
};
```

Then register in `commands/index.js`:
```javascript
const hello = require('./hello');
module.exports = {
  hello,
  // ... other commands
};
```

---

## 🐳 Docker Support

Build and run in Docker:

```bash
# Build image
docker build -t humblemorde-bot .

# Run container
docker run -p 3000:3000 --env-file .env humblemorde-bot
```

---

## 🔧 Troubleshooting

### QR Code Not Displaying
1. Ensure bot is running: `GET /health`
2. Clear browser cache
3. Check console for errors
4. Restart bot: `npm start`

### Bot Not Responding
1. Check WhatsApp connection status
2. Verify command prefix in `.env`
3. Review logs: `npm run dev`
4. Check environment variables

### Session Expired
1. Delete session data
2. Restart bot
3. Scan QR code again
4. Re-authenticate

### Port Already in Use
```bash
# Change port in .env or:
PORT=3001 npm start
```

---

## 📚 Documentation

- 🚀 **[Deployment Guide](DEPLOYMENT.md)** - Cloud platform setup
- 📖 **[API Reference](API.md)** - Detailed endpoint documentation
- 🎯 **[Command Guide](COMMANDS.md)** - Creating custom commands
- 🐛 **[Troubleshooting](TROUBLESHOOTING.md)** - Common issues

---

## 🤝 Contributing

We welcome contributions! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 💬 Support & Contact

**Have questions or issues?**

- 📧 **Email**: support@humblemorde.tech
- 🐛 **Issues**: [GitHub Issues](https://github.com/muimijohn52-bot/Humblemorde-tech/issues)
- 💡 **Discussions**: [GitHub Discussions](https://github.com/muimijohn52-bot/Humblemorde-tech/discussions)

---

## 🌟 Status

```
Status: ✅ Active & Maintained
Latest Version: 1.0.0
Last Updated: 2026-07-02
Stability: Production Ready
```

---

<div align="center">

### 🚀 Ready to Deploy?

**[View Deployment Guide](DEPLOYMENT.md)** • **[View Documentation](#-documentation)** • **[Report Issue](https://github.com/muimijohn52-bot/Humblemorde-tech/issues)**

Made with ❤️ by **Humblemorde Tech**

</div>
