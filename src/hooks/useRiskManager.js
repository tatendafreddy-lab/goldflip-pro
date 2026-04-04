import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  calculatePositionSize,
  calculateRiskReward,
  getDailyDrawdownStatus,
  getTradeJournal,
} from "../utils/riskEngine.js";

const STORAGE_KEY = "goldflip-risk-store";

export const useRiskManagerStore = create(
  persist(
    (set, get) => ({
      accountBalance: 25000,
      riskPercent: 1,
      entryPrice: 2300,
      stopLoss: 2295,
      apiKey: import.meta.env.VITE_GOLD_API_KEY || "",
      timezoneOffset: 120, // default UTC+2 (Africa/Harare), minutes offset from GMT
      alertSoundEnabled: true,
      mode: "live", // demo | live
      trades: [],

      setAccountBalance: (value) => set({ accountBalance: Number(value) || 0 }),
      setRiskPercent: (value) => set({ riskPercent: Number(value) || 0 }),
      setEntryPrice: (value) => set({ entryPrice: Number(value) || 0 }),
      setStopLoss: (value) => set({ stopLoss: Number(value) || 0 }),
      setApiKey: (value) => set({ apiKey: value || "" }),
      setTimezoneOffset: (value) => set({ timezoneOffset: Number(value) || 0 }),
      setAlertSoundEnabled: (value) => set({ alertSoundEnabled: Boolean(value) }),
      setMode: (value) => set({ mode: value === "live" ? "live" : "demo" }),

      addTrade: (trade) =>
        set((state) => {
          const stamped = { ...trade, timestamp: trade.timestamp ?? Date.now() };
          return { trades: [...state.trades, stamped] };
        }),

      clearDay: () =>
        set((state) => {
          const today = new Date().toDateString();
          const trades = state.trades.filter(
            (t) => new Date(t.timestamp || t.date).toDateString() !== today
          );
          return { trades };
        }),

      getPosition: () =>
        calculatePositionSize({
          accountBalance: get().accountBalance,
          riskPercent: get().riskPercent,
          entry: get().entryPrice,
          stopLoss: get().stopLoss,
        }),

      getRiskReward: (takeProfit) =>
        calculateRiskReward(get().entryPrice, get().stopLoss, takeProfit),

      getDailyStatus: () => getDailyDrawdownStatus(get().trades, get().accountBalance),

      getJournal: () => getTradeJournal(get().trades),
    }),
    {
      name: STORAGE_KEY,
      version: 4,
      migrate: (persistedState, version) => {
        if (!persistedState?.state) return persistedState;
        const next = { ...persistedState };

        if (version < 2) {
          next.state = { ...next.state, mode: "live" };
        }

        if (version < 3) {
          const tz = next.state?.timezoneOffset;
          if (tz === undefined || tz === null || tz === 0) {
            next.state = { ...next.state, timezoneOffset: 120 };
          }
        }

        // v4: backfill API key from env if missing
        if (version < 4) {
          const storedKey = next.state?.apiKey;
          const envKey = import.meta.env.VITE_GOLD_API_KEY;
          if ((!storedKey || storedKey.length === 0) && envKey) {
            next.state = { ...next.state, apiKey: envKey };
          }
        }

        next.version = 4;
        return next;
      },
    }
  )
);
