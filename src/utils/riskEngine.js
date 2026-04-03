const PIP_VALUE = 0.1; // gold pip = $0.10

export function calculatePositionSize({ accountBalance, riskPercent = 1, entry, stopLoss }) {
  const balance = Number(accountBalance) || 0;
  const riskPct = Number(riskPercent) || 0;
  const stopDistance = Math.abs((Number(entry) || 0) - (Number(stopLoss) || 0));

  if (balance <= 0 || riskPct <= 0 || stopDistance === 0) {
    return { positionSize: 0, dollarRisk: 0, maxLoss: 0 };
  }

  const dollarRisk = (balance * riskPct) / 100;
  const positionSize = dollarRisk / stopDistance;

  return {
    positionSize,
    dollarRisk,
    maxLoss: dollarRisk,
  };
}

export function calculateRiskReward(entry, stopLoss, takeProfit) {
  const e = Number(entry);
  const sl = Number(stopLoss);
  const tp = Number(takeProfit);

  if (![e, sl, tp].every(Number.isFinite)) {
    return { riskReward: null, riskPips: null, rewardPips: null };
  }

  const risk = Math.abs(e - sl);
  const reward = Math.abs(tp - e);
  const riskReward = risk === 0 ? null : reward / risk;

  return {
    riskReward,
    riskPips: risk / PIP_VALUE,
    rewardPips: reward / PIP_VALUE,
  };
}

export function getDailyDrawdownStatus(trades, accountBalance) {
  const today = new Date().toDateString();
  const losses = (trades || []).filter((t) => {
    const d = new Date(t.timestamp || t.date || Date.now()).toDateString();
    return d === today && Number(t.pnl) < 0;
  });

  const dailyLoss = losses.reduce((acc, t) => acc + Math.abs(Number(t.pnl) || 0), 0);
  const dailyLossPercent = accountBalance > 0 ? (dailyLoss / accountBalance) * 100 : 0;
  const isHaltTrading = dailyLossPercent > 3;

  return { dailyLoss, dailyLossPercent, isHaltTrading };
}

export function getTradeJournal(trades) {
  const totalTrades = trades.length;
  if (!totalTrades) {
    return {
      totalTrades: 0,
      winRate: 0,
      avgRR: 0,
      totalPnL: 0,
      bestTrade: null,
      worstTrade: null,
    };
  }

  const totalPnL = trades.reduce((acc, t) => acc + (Number(t.pnl) || 0), 0);
  const wins = trades.filter((t) => Number(t.pnl) > 0).length;
  const rrValues = trades
    .map((t) => Number(t.rr))
    .filter((v) => Number.isFinite(v) && v !== 0);
  const avgRR = rrValues.length ? rrValues.reduce((a, b) => a + b, 0) / rrValues.length : 0;
  const winRate = (wins / totalTrades) * 100;

  const bestTrade = trades.reduce(
    (best, t) => (best === null || Number(t.pnl) > Number(best.pnl) ? t : best),
    null
  );
  const worstTrade = trades.reduce(
    (worst, t) => (worst === null || Number(t.pnl) < Number(worst.pnl) ? t : worst),
    null
  );

  return { totalTrades, winRate, avgRR, totalPnL, bestTrade, worstTrade };
}
