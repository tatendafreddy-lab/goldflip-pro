const pillColors = {
  buy: "bg-emerald-400/10 text-emerald-200 ring-1 ring-emerald-400/40",
  sell: "bg-rose-400/10 text-rose-200 ring-1 ring-rose-400/40",
  neutral: "bg-slate-500/10 text-slate-200 ring-1 ring-slate-500/30",
  WAIT: "bg-slate-500/10 text-slate-200 ring-1 ring-slate-500/30",
};

function AgreementRow({ label, agrees }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-900/60 px-3 py-2 text-sm text-slate-200">
      <span>{label}</span>
      <span className={`text-lg ${agrees ? "text-emerald-300" : "text-rose-300"}`}>{agrees ? "✔" : "✖"}</span>
    </div>
  );
}

function SignalPanel({ signal }) {
  const lb = signal?.londonBreakout ?? {};
  const allAgree =
    lb.signal === "BUY" && signal?.rsi?.signal === "buy" && signal?.macd?.signal === "buy" ||
    lb.signal === "SELL" && signal?.rsi?.signal === "sell" && signal?.macd?.signal === "sell";

  return (
    <div className="glass-panel p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Signals</p>
          <h3 className="text-xl font-semibold text-slate-50">London Breakout</h3>
        </div>
        {lb.isKillZone ? (
          <span className="animate-pulse rounded-full bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase text-emerald-200 ring-1 ring-emerald-400/50">
            Kill Zone Active
          </span>
        ) : (
          <span className="rounded-full bg-slate-700/60 px-3 py-1 text-[11px] font-semibold uppercase text-slate-200 ring-1 ring-slate-600/40">
            Outside Kill Zone
          </span>
        )}
      </div>

      <div className="rounded-xl border border-slate-800/70 bg-slate-900/70 p-4 text-center">
        <p className={`mx-auto mb-2 inline-block rounded-full px-4 py-1 text-xs font-semibold uppercase ${pillColors[lb.signal || "WAIT"]}`}>
          {lb.signal || "WAIT"}
        </p>
        <div className="text-3xl font-semibold text-amber-200">
          {lb.entry ? `$${lb.entry.toFixed(2)}` : "No setup"}
        </div>
        <div className="mt-2 grid grid-cols-3 gap-3 text-sm text-slate-300">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Stop</p>
            <p className="text-rose-200">{lb.stopLoss ? `$${lb.stopLoss.toFixed(2)}` : "--"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Take profit</p>
            <p className="text-emerald-200">{lb.takeProfit ? `$${lb.takeProfit.toFixed(2)}` : "--"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">R:R</p>
            <p className="text-slate-100">{lb.riskReward ? lb.riskReward.toFixed(2) : "--"}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        <AgreementRow label="RSI in agreement" agrees={lb.signal === "BUY" ? signal?.rsi?.signal === "buy" : lb.signal === "SELL" ? signal?.rsi?.signal === "sell" : false} />
        <AgreementRow label="MACD in agreement" agrees={lb.signal === "BUY" ? signal?.macd?.signal === "buy" : lb.signal === "SELL" ? signal?.macd?.signal === "sell" : false} />
      </div>

      {allAgree && (
        <div className="mt-3 rounded-lg border border-amber-300/50 bg-amber-300/10 px-3 py-2 text-sm font-semibold text-amber-100">
          All 3 signals agree. This is a qualified setup — still size risk appropriately.
        </div>
      )}
    </div>
  );
}

export default SignalPanel;
