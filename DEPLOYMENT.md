# 🚀 Deployment Guide

This guide covers deploying the Humblemorde Tech WhatsApp Bot to popular cloud platforms.

---

## Table of Contents
- [Heroku](#heroku)
- [Render](#render)
- [Railway](#railway)
- [Environment Variables](#environment-variables)

---

## Heroku

### Prerequisites
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
- Heroku account
- Git repository

### Steps

1. **Login to Heroku**
   ```bash
   heroku login
   ```

2. **Create a new Heroku app**
   ```bash
   heroku create your-app-name
   ```

3. **Set environment variables**
   ```bash
   heroku config:set BOT_PREFIX="!"
   heroku config:set NODE_ENV="production"
   heroku config:set WHATSAPP_SESSION_KEY="your-key"
   ```

4. **Deploy the app**
   ```bash
   git push heroku main
   ```

5. **View logs**
   ```bash
   heroku logs --tail
   ```

6. **Access QR Code**
   ```
   https://your-app-name.herokuapp.com/qr
   ```

### Notes
- Heroku free tier is no longer available
- Paid dynos start at $5/month
- Session data persists on the dyno

---

## Render

### Prerequisites
- [Render account](https://render.com)
- GitHub repository connected to Render

### Steps

1. **Connect Repository**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +"
   - Select "Web Service"
   - Connect your GitHub repo

2. **Configure Service**
   - **Name**: `humblemorde-tech-bot`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or Starter)

3. **Set Environment Variables**
   - Go to Environment → Add Variable
   - Add these variables:
     - `PORT`: `3000`
     - `NODE_ENV`: `production`
     - `BOT_PREFIX`: `!`
     - Other WhatsApp credentials

4. **Deploy**
   - Render automatically deploys on push to main
   - View status in Dashboard

5. **Access QR Code**
   ```
   https://your-service-name.onrender.com/qr
   ```

### Notes
- Free tier has limited resources
- 15-minute auto-spin-down after inactivity
- Database support available (paid)

---

## Railway

### Prerequisites
- [Railway account](https://railway.app)
- GitHub repository

### Steps

1. **Connect to Railway**
   - Go to [Railway Dashboard](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Authorize and select your repository

2. **Configure Environment**
   - Railway auto-detects Node.js
   - Uses `railway.json` for configuration

3. **Set Environment Variables**
   - Go to Variables tab
   - Add these variables:
     ```
     PORT=3000
     NODE_ENV=production
     BOT_PREFIX=!
     ```

4. **Deploy**
   - Railway automatically deploys on push
   - View logs in real-time

5. **Access QR Code**
   - Get the generated URL from Railway
   - Format: `https://your-project.railway.app/qr`

### Generate Public URL
```bash
railway link  # Connect local repo
railway up    # Deploy
railway open  # Open in browser
```

### Notes
- Free tier provides $5/month credit
- Generous free tier limits
- Session persistence with storage add-on

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|----------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `production` or `development` |
| `BOT_PREFIX` | Command prefix | `!` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|----------|
| `LOG_LEVEL` | Logging verbosity | `debug`, `info`, `error` |
| `WEBHOOK_URL` | Webhook for external events | `https://yoursite.com/webhook` |

### Setup Command Cheat Sheet

**Heroku**
```bash
heroku config:set KEY=value
```

**Render**
- Use Dashboard → Environment

**Railway**
- Use Dashboard → Variables

---

## Health Check URLs

All platforms support health checks:

```bash
GET /health
```

Response:
```json
{
  "status": "Bot is running"
}
```

---

## QR Code Access

After deployment, access the QR code pairing page:

- **Heroku**: `https://your-app.herokuapp.com/qr`
- **Render**: `https://your-service.onrender.com/qr`
- **Railway**: `https://your-project.railway.app/qr`

---

## Troubleshooting

### Bot Not Starting
1. Check logs: `heroku logs --tail` (Heroku)
2. Verify environment variables are set
3. Ensure `package.json` has correct dependencies

### QR Code Not Loading
1. Verify bot is running: `/health` endpoint
2. Clear browser cache
3. Restart the service

### Session Lost After Restart
- Session data is stored in application memory
- Use persistent storage solutions for production
- Consider database integration for session persistence

---

## Local Testing

Before deploying, test locally:

```bash
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
# Visit http://localhost:3000/qr
```

---

## Support

For platform-specific help:
- [Heroku Documentation](https://devcenter.heroku.com)
- [Render Documentation](https://docs.render.com)
- [Railway Documentation](https://docs.railway.app)

---

**Questions?** Contact support@humblemorde.tech
