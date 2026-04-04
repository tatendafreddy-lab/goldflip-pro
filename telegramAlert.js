export async function sendTelegramAlert(signal) {
  const emoji = signal.direction === "BUY" ? "🟢" : "🔴";
  const message = `
${emoji} GOLDFLIP PRO SIGNAL
XAU/USD ${signal.direction}

Entry: $${signal.entry}
Stop Loss: $${signal.stopLoss}
Take Profit: $${signal.takeProfit}
Risk:Reward: ${signal.riskReward}R
Confidence: ${signal.confidence}%

Strategy: London Breakout
Time: ${new Date().toUTCString()}

GoldFlip Pro — goldflip.vercel.app
  `.trim();

  await fetch("/api/telegram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
}
