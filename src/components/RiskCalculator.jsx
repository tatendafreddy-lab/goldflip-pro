import { useMemo } from "react";
import { calculatePositionSize } from "../utils/riskEngine.js";

function Stat({ label, value, accent = false, danger = false }) {
  return (
    <div
      className={`flex flex-col rounded-lg border px-3 py-2 ${
        danger ? "border-rose-500/60 bg-rose-900/20" : "border-slate-800/80 bg-slate-800/40"
      }`}
    >
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`text-lg font-semibold ${accent ? "text-amber-300" : danger ? "text-rose-200" : "text-slate-100"}`}>
        {value}
      </p>
    </div>
  );
}

function RiskCalculator({ riskManager }) {
  const {
    accountBalance,
    riskPercent,
    entryPrice,
    stopLoss,
    setAccountBalance,
    setRiskPercent,
    setEntryPrice,
    setStopLoss,
    getPosition,
    getDailyStatus,
    getJournal,
  } = riskManager;

  const { positionSize, dollarRisk } = useMemo(() => getPosition(), [accountBalance, riskPercent, entryPrice, stopLoss]);

  const takeProfit = useMemo(() => {
    const dist = entryPrice - stopLoss;
    if (!Number.isFinite(dist) || dist === 0) return null;
    // 2R target
    return stopLoss < entryPrice ? entryPrice + Math.abs(dist) * 2 : entryPrice - Math.abs(dist) * 2;
  }, [entryPrice, stopLoss]);

  const daily = getDailyStatus();
  const journal = getJournal();

  const riskWarning = riskPercent > 2;

  return (
    <div className="glass-panel p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Risk toolbox</p>
          <h3 className="text-xl font-semibold text-slate-50">Protect the stack</h3>
        </div>
        {daily.isHaltTrading ? (
          <span className="animate-pulse rounded-full bg-rose-500/20 px-3 py-1 text-[11px] font-semibold uppercase text-rose-100 ring-1 ring-rose-500/60">
            Trading halted ({daily.dailyLossPercent.toFixed(2)}% DD)
          </span>
        ) : (
          <span className="rounded-full bg-slate-700/70 px-3 py-1 text-[11px] font-semibold uppercase text-slate-200 ring-1 ring-slate-600/50">
            Daily DD {daily.dailyLossPercent.toFixed(2)}%
          </span>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs uppercase tracking-wide text-slate-400">Account balance ($)</span>
          <input
            type="number"
            value={accountBalance}
            onChange={(e) => setAccountBalance(Number(e.target.value || 0))}
            className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-slate-100 focus:border-amber-300 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-slate-400">Risk per trade (%)</span>
            <span className={`text-xs ${riskWarning ? "text-rose-300" : "text-slate-300"}`}>{riskPercent.toFixed(2)}%</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={3}
            step={0.1}
            value={riskPercent}
            onChange={(e) => setRiskPercent(Number(e.target.value))}
            className="accent-amber-300"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs uppercase tracking-wide text-slate-400">Entry price</span>
          <input
            type="number"
            step="0.1"
            value={entryPrice}
            onChange={(e) => setEntryPrice(Number(e.target.value || 0))}
            className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-slate-100 focus:border-amber-300 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs uppercase tracking-wide text-slate-400">Stop loss</span>
          <input
            type="number"
            step="0.1"
            value={stopLoss}
            onChange={(e) => setStopLoss(Number(e.target.value || 0))}
            className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-slate-100 focus:border-amber-300 focus:outline-none"
          />
        </label>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="Position size (oz)" value={Number.isFinite(positionSize) ? positionSize.toFixed(2) : "--"} accent />
        <Stat
          label="Dollar risk"
          value={Number.isFinite(dollarRisk) ? `$${dollarRisk.toFixed(2)}` : "--"}
          danger={riskWarning}
        />
        <Stat
          label="Take profit (2R)"
          value={Number.isFinite(takeProfit) ? `$${takeProfit.toFixed(2)}` : "--"}
        />
      </div>

      {riskWarning && (
        <p className="mt-2 rounded-lg border border-rose-500/50 bg-rose-900/20 px-3 py-2 text-xs text-rose-100">
          Warning: risk per trade above 2%. Consider dialing down to protect the account.
        </p>
      )}

      {daily.isHaltTrading && (
        <div className="mt-3 rounded-lg border border-rose-500/60 bg-rose-900/30 px-3 py-2 text-sm text-rose-100">
          TRADING HALTED: Daily drawdown limit exceeded. Step away and reassess.
        </div>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <Stat label="Trades today" value={journal.totalTrades} />
        <Stat label="Win rate" value={`${journal.winRate.toFixed(1)}%`} />
        <Stat label="Avg RR" value={journal.avgRR.toFixed(2)} />
        <Stat label="Total PnL" value={`$${journal.totalPnL.toFixed(2)}`} />
      </div>
    </div>
  );
}

export default RiskCalculator;
