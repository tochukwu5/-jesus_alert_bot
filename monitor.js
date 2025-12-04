// monitor.js (CommonJS - cleaned & improved)
const fetch = require("node-fetch");
require("dotenv").config();

const {
  TARGET_MARKETCAP,
  TOKEN_ADDRESS,
  USE = "dexscreener",
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID,
  ALERT_REPEAT = 5,
  ALERT_COOLDOWN_MIN = 60
} = process.env;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID || !TOKEN_ADDRESS) {
  console.error("❌ Missing TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, or TOKEN_ADDRESS");
  process.exit(1);
}

const target = Number(TARGET_MARKETCAP || 500000);
const intervalMs = 5000; // check every 5 seconds
const cooldownMs = Number(ALERT_COOLDOWN_MIN || 60) * 60 * 1000;

let lastAlertAt = 0;
let lastMarketCap = null;

// ---------------- UTILS ----------------
const delay = ms => new Promise(res => setTimeout(res, ms));

// ---------------- TELEGRAM ----------------
async function telegramSend(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: "Markdown",
        disable_notification: false
      })
    });

    return await res.json();
  } catch (err) {
    console.error("Telegram Error:", err.message);
  }
}

// ---------------- API SOURCES ----------------
async function fetchDexScreener(addr) {
  const url = `https://api.dexscreener.com/latest/dex/tokens/${addr}`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`Dexscreener ${res.status}`);

  return res.json();
}

function extractMarketCapFromDexscreener(data) {
  if (!data?.pairs?.length) return null;

  const p = data.pairs[0];

  const mc =
    Number(p.fdv) ||
    Number(p.marketCap) ||
    Number(p.estimatedMarketCap);

  return isNaN(mc) ? null : mc;
}

// ---------------- MAIN MONITOR ----------------
async function checkOnce() {
  try {
    let mc = null;

    if (USE === "dexscreener") {
      const data = await fetchDexScreener(TOKEN_ADDRESS);
      mc = extractMarketCapFromDexscreener(data);
    }

    const now = Date.now();
    console.log(new Date().toISOString(), "| MC:", mc);

    if (mc && mc >= target) {

      // Prevent repeated alerts for exact same MC
      if (mc === lastMarketCap) {
        console.log("Same market cap, no new alert.");
        return;
      }

      if (now - lastAlertAt < cooldownMs) {
        console.log("Target hit, but still in cooldown.");
        return;
      }

      lastAlertAt = now;
      lastMarketCap = mc;

      const message = `
🚨 *MARKET CAP ALERT*

Token:
\`${TOKEN_ADDRESS}\`

Market Cap: *$${mc.toLocaleString()}*
Target: *$${target.toLocaleString()}*

Time: ${new Date().toLocaleString()}
      `;

      // Send multiple alerts every 5 seconds
      for (let i = 1; i <= Number(ALERT_REPEAT); i++) {
        await telegramSend(message + `\n🔔 Alarm (${i}/${ALERT_REPEAT})`);
        await delay(5000);
      }

      console.log("✅ Alert sequence completed.");
    }

  } catch (err) {
    console.error("Error in checkOnce:", err.message || err);
  }
}

console.log("✅ Token Monitor Started");
console.log("Source:", USE);
console.log("Target:", target.toLocaleString());

checkOnce();
setInterval(checkOnce, intervalMs);
