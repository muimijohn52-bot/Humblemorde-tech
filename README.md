# Humblemorde Tech WhatsApp Bot

🤖 A powerful WhatsApp bot for Humblemorde Tech with command handling and automated responses.

## Features

- ✅ WhatsApp integration
- 📝 Command system with prefix support
- 🔧 Message handling
- 📊 Bot information and help
- 🚀 Express server for API endpoints
- 🎯 Easy to extend with new commands

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- WhatsApp account

### Setup

1. Clone the repository:

```bash
git clone https://github.com/muimijohn52-bot/Humblemorde-tech.git
cd Humblemorde-tech
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

4. Configure your WhatsApp credentials in `.env`

5. Start the bot:

```bash
npm start
```

OR for development mode with auto-reload:

```bash
npm run dev
```

## Usage

### Commands

- `!help` - Show help menu
- `!info` - Bot information
- `!ping` - Check response time
- `!about` - About Humblemorde Tech
- `!support` - Support information

### API Endpoints

#### Health Check
```
GET /health
```

Response:
```json
{ "status": "Bot is running" }
```

#### Send Message
```
POST /api/send-message
```

Request body:
```json
{
  "number": "1234567890",
  "message": "Hello!"
}
```

## Project Structure

```
├── server.js                 # Main bot file
├── package.json              # Dependencies
├── .env.example              # Environment variables template
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
└── README.md                 # Documentation
```

## Contributing

Feel free to fork this project and submit pull requests!

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please contact support@humblemorde.tech
