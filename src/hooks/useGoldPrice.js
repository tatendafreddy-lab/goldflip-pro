import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

const API_URL = "/api/gold";
const CACHE_KEY = "goldflip-price-cache-v2";
const CACHE_TTL_MS = 60_000;

function generateMockOhlcv(points = 80, seedPrice = 3150) { /* unchanged mock generator */ 
  const out = [];
  let close = seedPrice;
  for (let i = points - 1; i >= 0; i -= 1) {
    const time = Date.now() - i * 30 * 60 * 1000;
    const drift = (Math.random() - 0.48) * 6;
    const open = close;
    close = Math.max(3000, Math.min(3400, close + drift));
    const high = Math.max(open, close) + Math.random() * 2.5;
    const low = Math.min(open, close) - Math.random() * 2.5;
    const volume = 120 + Math.random() * 80;
    out.push({
      time,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Number(volume.toFixed(2)),
    });
  }
  return out;
}

function readCache() { try { const raw = localStorage.getItem(CACHE_KEY); if (!raw) return null; const parsed = JSON.parse(raw); if (!parsed?.timestamp || !parsed?.price) return null; return parsed; } catch { return null; } }
function writeCache(payload) { try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ...payload, timestamp: Date.now() })); } catch {} }

function parsePrice(data) {
  if (!data) return NaN;
  if (typeof data.price === "number") return data.price;
  const candidates = [data.value, data.XAU, data.XAU_price, data.rate];
  for (const c of candidates) if (typeof c === "number" && Number.isFinite(c)) return c;
  if (Array.isArray(data) && Array.isArray(data[0])) return Number(data[0][1]);
  if (Array.isArray(data) && typeof data[0] === "number") return data[0];
  return NaN;
}

export function useGoldPrice(apiKey, mode = "live") {
  const [ohlcv, setOhlcv] = useState([]);
  const [price, setPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);
  const [source, setSource] = useState("init");
  const priceRef = useRef(0);

  useEffect(() => { priceRef.current = price; }, [price]);

  useEffect(() => {
    let cancelled = false;
    let interval;

    const appendCandle = (prev, latestPrice) => {
      const base = prev?.length ? prev.slice(-79) : generateMockOhlcv(79, latestPrice);
      const last = base[base.length - 1] || { close: latestPrice };
      const newCandle = {
        time: Date.now(),
        open: last.close,
        high: Math.max(last.close, latestPrice) + Math.random() * 0.5,
        low: Math.min(last.close, latestPrice) - Math.random() * 0.5,
        close: latestPrice,
        volume: 150 + Math.random() * 50,
      };
      return [...base, newCandle];
    };

    const runDemo = () => {
      const seedPrice = priceRef.current || 3150;
      const mock = generateMockOhlcv(80, seedPrice);
      const mockPrice = mock[mock.length - 1]?.close ?? seedPrice;
      setOhlcv(mock);
      setPrice(mockPrice);
      setIsMock(true);
      setSource("demo");
      setError(null);
      setIsLoading(false);
      writeCache({ price: mockPrice, ohlcv: mock, isMock: true });
    };

    const fetchPrice = async () => {
      const cache = readCache();
      const now = Date.now();
      if (cache && now - cache.timestamp < CACHE_TTL_MS) {
        if (!(mode === "live" && cache.isMock)) {
          if (!cancelled) {
            setPrice(cache.price);
            setOhlcv(cache.ohlcv || []);
            setIsMock(cache.isMock || false);
            setSource(cache.isMock ? "demo" : "live");
            setIsLoading(false);
          }
          return;
        }
      }

      try {
        if (!cancelled) setIsLoading(true);

        const response = await axios.get(API_URL, {
          timeout: 8000,
          headers: apiKey ? { "x-gold-key": apiKey } : undefined,
        });

        console.log("[useGoldPrice] Raw response:", response.status, response.data);

        if (response.status !== 200) throw new Error(`HTTP ${response.status}`);

        const latestPrice = parsePrice(response.data);
        if (!Number.isFinite(latestPrice) || latestPrice <= 0) {
          throw new Error(`Unexpected response shape: ${JSON.stringify(response.data).slice(0, 120)}`);
        }

        if (!cancelled) {
          setPrice(latestPrice);
          setIsMock(false);
          setSource("live");
          setError(null);
          setOhlcv((prev) => {
            const next = appendCandle(prev, latestPrice);
            writeCache({ price: latestPrice, ohlcv: next, isMock: false });
            return next;
          });
          setIsLoading(false);
        }
      } catch (err) {
        console.error("[useGoldPrice] Fetch failed:", err.message);

        const cache = readCache();
        if (cache) {
          if (!cancelled) {
            setPrice(cache.price);
            setOhlcv(cache.ohlcv || []);
            setIsMock(cache.isMock || false);
            setSource(cache.isMock ? "demo" : "live");
            setError(null);
            setIsLoading(false);
          }
          return;
        }

        if (!cancelled) {
          runDemo();
          setError(err?.message || "Network error");
        }
      }
    };

    if (mode === "demo") {
      runDemo();
      return () => {
        cancelled = true;
        if (interval) clearInterval(interval);
      };
    }

    void fetchPrice();
    interval = setInterval(fetchPrice, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [mode, apiKey]);

  const changePct = useMemo(() => {
    if (ohlcv.length < 2) return 0;
    const first = ohlcv[0].close;
    const last = ohlcv[ohlcv.length - 1].close;
    return ((last - first) / first) * 100;
  }, [ohlcv]);

  return { price, ohlcv, isLoading, error, isMock, changePct, source };
}
