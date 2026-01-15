// src/sentinel/telegram.ts

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

/**
 * 1. The Core Sender
 * This is the raw function that talks to Telegram's servers.
 */
async function sendTelegramMessage(chatId: string, text: string) {
  if (!BOT_TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN is missing in .env.local");
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown' // Allows us to use *bold* text
      })
    });

    const data = await response.json();
    
    if (!data.ok) {
      console.error("⚠️ Telegram Error:", data.description);
      throw new Error(data.description);
    }
    
    return data;
  } catch (error) {
    console.error("❌ Network Error sending Telegram message:", error);
  }
}

/**
 * 2. Alert the Guardian (The "Trigger")
 * This is the SHAME message sent when the timer hits 0.
 * Referenced by: /api/sentinel/alert/route.ts
 */
export async function sendAlertMessage(chatId: string, guardianName: string, hoursMissed: number | string) {
  const message = `🚨 *SENTINEL PROTOCOL ALERT* 🚨

Hello *${guardianName}*,

This is an automated notification from Krama.
*The user has FAILED their daily Deep Work goal.*

📉 *Missed by:* ${hoursMissed} Hours

They promised to do the work, but they did not. 
It is your duty to hold them accountable.

_"Discipline is destiny."_`;

  await sendTelegramMessage(chatId, message);
}

/**
 * 3. Warn the Student (The "Nudge")
 * Runs when time is running low (e.g., 2 hours left).
 * Feature preserved for future nudges.
 */
export async function warnStudent(chatId: string, hoursLeft: number) {
  const message = `⚠️ *Proctor Warning*

You have *${hoursLeft} hours* remaining on your protocol timer.
Log a Focus Session or Complete a Topic to reset the Sentinel.

_Do not let the timer expire._`;

  await sendTelegramMessage(chatId, message);
}

/**
 * 4. Verification Message
 * Sent when they first connect the bot.
 */
export async function sendWelcomeMessage(chatId: string, name: string) {
  const message = `✅ *Connected Successfully*
  
Hello ${name}. The Krama Sentinel is now active.
I will alert you if the Protocol is breached.`;

  await sendTelegramMessage(chatId, message);
}