// index.js — Aternos Auto Login + AFK Bot
// Works with Render/Replit — cracked username support

const mineflayer = require("mineflayer");
const express = require("express");
const fs = require("fs");

const WEB_PORT = process.env.PORT || 8080;
const HOST = "Unkown_SMP.aternos.me";
const MC_PORT = 49664;
const USERNAME = "kushflayer";
const PASSWORD = "welcomebot";
const VERSION = "1.20.1";
const REGISTER_FILE = "registered.json";

let reconnecting = false;

// 🕸 Keep app alive (for Render/Replit uptime)
const app = express();
app.get("/", (req, res) => res.send("🤖 Aternos Bot is online and running!"));
app.listen(WEB_PORT, () =>
  console.log(`🌐 Web server running on port ${WEB_PORT}`)
);

// 🧠 Create Bot Function
function createBot() {
  const bot = mineflayer.createBot({
    host: HOST,
    port: MC_PORT,
    username: USERNAME,
    version: VERSION,
    auth: "offline",
  });

  // When bot joins the server
  bot.once("spawn", () => {
    console.log(`✅ Bot joined ${HOST} as ${USERNAME}`);

    let alreadyRegistered = false;
    try {
      if (fs.existsSync(REGISTER_FILE)) {
        const data = JSON.parse(fs.readFileSync(REGISTER_FILE, "utf8"));
        alreadyRegistered = !!data.registered;
      }
    } catch (err) {
      console.log("⚠️ Error reading register file:", err);
    }

    if (!alreadyRegistered) {
      console.log("📝 Registering new account...");
      bot.chat(`/register ${PASSWORD}`);
      fs.writeFileSync(REGISTER_FILE, JSON.stringify({ registered: true }));
    } else {
      console.log("🔐 Logging in...");
      setTimeout(() => bot.chat(`/login ${PASSWORD}`), 3000);
    }

    // Anti-AFK — jump every 15s
    setInterval(() => {
      bot.setControlState("jump", true);
      setTimeout(() => bot.setControlState("jump", false), 400);
    }, 15000);
  });

  // Handle disconnects gracefully
  bot.on("end", () => {
    console.log("❌ Disconnected — will reconnect in 15s...");
    if (!reconnecting) {
      reconnecting = true;
      setTimeout(() => {
        reconnecting = false;
        createBot();
      }, 15000);
    }
  });

  // Handle being kicked
  bot.on("kicked", (reason) => {
    console.log("💢 Kicked from server:", reason);
    console.log("🔁 Reconnecting in 15s...");
    setTimeout(createBot, 15000);
  });

  // Catch errors without crashing app
  bot.on("error", (err) => {
    console.log("⚠️ Bot error:", err);
  });
}

createBot();
