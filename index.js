// index.js — Aternos Auto Login + AFK Bot (Render Ready)
// Updated for Minecraft 1.21.4 — Cracked login support

const mineflayer = require("mineflayer");
const express = require("express");
const fs = require("fs");

// ====== CONFIGURATION ======
const HOST = "Unkown_SMP.aternos.me"; // your server address (check Aternos)
const MC_PORT = 49664;                // update this if Aternos changes
const USERNAME = "kushflayer";        // cracked username
const PASSWORD = "welcomebot";        // password for /register and /login
const VERSION = "1.21.4";             // match your Aternos server version
const WEB_PORT = process.env.PORT || 8080;
const REGISTER_FILE = "registered.json";
// ============================

// small web server to keep Render/Replit awake
const app = express();
app.get("/", (req, res) => res.send("🤖 Aternos Bot is online and running 24/7!"));
app.listen(WEB_PORT, () => console.log(`🌐 Web server active on port ${WEB_PORT}`));

// helper to safely read JSON
function loadRegisterStatus() {
  try {
    if (fs.existsSync(REGISTER_FILE)) {
      const data = JSON.parse(fs.readFileSync(REGISTER_FILE, "utf8"));
      return !!data.registered;
    }
  } catch (err) {
    console.log("⚠️ Error reading register file:", err);
  }
  return false;
}

// helper to save JSON
function saveRegisterStatus() {
  try {
    fs.writeFileSync(REGISTER_FILE, JSON.stringify({ registered: true }));
  } catch (err) {
    console.log("⚠️ Error saving register file:", err);
  }
}

// ===== MAIN BOT FUNCTION =====
function startBot() {
  console.log("🚀 Starting bot...");

  const bot = mineflayer.createBot({
    host: HOST,
    port: MC_PORT,
    username: USERNAME,
    version: VERSION,
    auth: "offline",
  });

  bot.once("spawn", () => {
    console.log(`✅ Joined ${HOST}:${MC_PORT} as ${USERNAME}`);

    const alreadyRegistered = loadRegisterStatus();

    if (!alreadyRegistered) {
      console.log("📝 First time detected, registering...");
      bot.chat(`/register ${PASSWORD}`);
      saveRegisterStatus();
      setTimeout(() => bot.chat(`/login ${PASSWORD}`), 2000);
    } else {
      console.log("🔐 Logging in...");
      setTimeout(() => bot.chat(`/login ${PASSWORD}`), 2000);
    }

    // 💤 Anti-AFK (jump every 15s)
    setInterval(() => {
      bot.setControlState("jump", true);
      setTimeout(() => bot.setControlState("jump", false), 400);
    }, 15000);
  });

  // reconnect on disconnect
  bot.on("end", () => {
    console.log("❌ Bot disconnected. Reconnecting in 20s...");
    setTimeout(startBot, 20000);
  });

  // reconnect on kick
  bot.on("kicked", (reason) => {
    console.log("💢 Kicked:", reason);
    console.log("🔁 Retrying in 20s...");
    setTimeout(startBot, 20000);
  });

  // handle errors gracefully
  bot.on("error", (err) => {
    console.log("⚠️ Error:", err);
  });
}

startBot();
