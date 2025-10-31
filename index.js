// index.js (CommonJS) — cracked username: kushflayer

const mineflayer = require('mineflayer');
const express = require('express');
const fs = require('fs');

const WEB_PORT = 8080;
const PASSWORD = "welcomebot";      // <-- change to your real register/login password
const REGISTER_FILE = "registered.json";
const HOST = "Unkown_SMP.aternos.me";
const MC_PORT = 49664;              // <-- updated port
const USERNAME = "kushflayer";      // <-- cracked username

// small web server to keep Replit awake
const app = express();
app.get('/', (req, res) => res.send('🤖 Aternos AFK Bot running'));
app.listen(WEB_PORT, () => console.log(`Web server listening on ${WEB_PORT}`));

function createBot() {
  const bot = mineflayer.createBot({
    host: HOST,
    port: MC_PORT,
    username: USERNAME,
    version: "1.20.1",
    auth: "offline"
  });

  bot.once('spawn', () => {
    console.log('✅ Bot joined the server as', USERNAME);

    // check storage for first-time register
    let alreadyRegistered = false;
    try {
      if (fs.existsSync(REGISTER_FILE)) {
        const data = JSON.parse(fs.readFileSync(REGISTER_FILE, 'utf8'));
        alreadyRegistered = !!data.registered;
      }
    } catch (e) {
      console.log('⚠️ Error reading register file:', e);
    }

    if (!alreadyRegistered) {
      console.log('📝 Registering (first time)...');
      bot.chat(`/register ${PASSWORD}`);
      try {
        fs.writeFileSync(REGISTER_FILE, JSON.stringify({ registered: true }));
      } catch (e) {
        console.log('⚠️ Could not write register file:', e);
      }
    } else {
      console.log('🔐 Logging in...');
      setTimeout(() => bot.chat(`/login ${PASSWORD}`), 2000);
    }

    // simple anti-AFK: jump every 10s
    setInterval(() => {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 500);
    }, 10000);
  });

  bot.on('end', () => {
    console.log('❌ Disconnected — reconnecting in 10s...');
    setTimeout(createBot, 10000);
  });

  bot.on('kicked', reason => {
    console.log('💢 Kicked:', reason);
  });

  bot.on('error', err => {
    console.log('⚠️ Bot error:', err);
  });
}

createBot(); 
