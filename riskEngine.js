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

export function calculateKelly({ winRate, avgWin, avgLoss, accountBalance }) {
  const w = Number(winRate);
  const avgW = Number(avgWin);
  const avgL = Math.abs(Number(avgLoss));
  const balance = Number(accountBalance) || 0;

  if (!Number.isFinite(w) || !Number.isFinite(avgW) || !Number.isFinite(avgL) || balance <= 0) {
    return {
      fullKelly: 0,
      halfKelly: 0,
      quarterKelly: 0,
      dollarFull: 0,
      dollarHalf: 0,
      dollarQuarter: 0,
      recommendation: 0,
      warning: "Insufficient data for Kelly",
    };
  }

  // winRate provided as fraction (0-1) or percent (0-100)
  const p = w > 1 ? w / 100 : w;
  const q = 1 - p;

  // K = (p/avgLoss) - (q/avgWin)
  let K = (p / avgL) - (q / avgW);
  if (!Number.isFinite(K) || K < 0) K = 0;

  const cap = 0.05; // hard cap 5%
  const fullKelly = Math.min(K, cap);
  const halfKelly = Math.min(fullKelly * 0.5, cap);
  const quarterKelly = Math.min(fullKelly * 0.25, cap);

  const dollarFull = balance * fullKelly;
  const dollarHalf = balance * halfKelly;
  const dollarQuarter = balance * quarterKelly;

  let warning = "";
  if (fullKelly > 0.1) {
    warning = "High confidence edge — cap at 5% until 100+ trades";
  }

  return {
    fullKelly,
    halfKelly,
    quarterKelly,
    dollarFull,
    dollarHalf,
    dollarQuarter,
    recommendation: halfKelly,
    warning,
  };
}
