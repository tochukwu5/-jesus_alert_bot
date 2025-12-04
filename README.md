Jesus Alert Bot

Jesus Alert Bot notifies users when the Dollar Jesus (JESUS) coin hits price, market cap, or custom thresholds—keeping traders updated in real-time.

Features

Real-time JESUS coin alerts

Customizable thresholds (price, market cap, volume)

Sends notifications via Telegram

Lightweight and easy to deploy

Tech

Node.js & JavaScript

Axios / node-fetch for API requests

Telegram Bot API for alerts

dotenv for environment variables

Installation
git clone https://github.com/tochukwu5/-jesus_alert_bot.git
cd jesus-alert-bot
npm install


Create a .env file:

TELEGRAM_BOT_TOKEN=your_telegram_bot_token
CHAT_ID=your_chat_id
ALERT_PRICE=0.0001
ALERT_MARKETCAP=500000


⚠️ Do not commit .env to GitHub.

Usage
node monitor.js


Optional (run continuously):

npm install -g pm2
pm2 start monitor.js --name "jesus-alert-bot"

Contributing

Fork the repo and submit pull requests. Contributions to alerts, notifications, or performance are welcome.

License

MIT License

Contact

Author: David Emeremgini

Portfolio: daviwork.vercel.app

Email: tochukwud750@gmail.com

⚠️ Informational only. Crypto trading is risky. Do your research before trading.
