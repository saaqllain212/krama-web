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
        parse_mode: 'Markdown' // Allows us to use **bold** text
      })
    });

    const data = await response.json();
    
    if (!data.ok) {
      console.error("⚠️ Telegram Error:", data.description);
    }
  } catch (error) {
    console.error("❌ Network Error sending Telegram message:", error);
  }
}

/**
 * 2. Alert the Guardian (The "Trigger")
 * Runs when the timer hits 0.
 */
export async function notifyGuardian(chatId: string, studentName: string, hoursInactive: number) {
  const message = `🚨 *Krama Protocol Alert*
  
Student: _${studentName}_
Status: ❌ **MIA (Missing In Action)**
Inactive for: ${hoursInactive} hours.

Please check on them immediately. They have failed to check in.`;

  await sendTelegramMessage(chatId, message);
}

/**
 * 3. Warn the Student (The "Nudge")
 * Runs when time is running low (e.g., 2 hours left).
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