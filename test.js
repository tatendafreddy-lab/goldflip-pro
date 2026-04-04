export default function handler(req, res) {
  const key1 = process.env.VITE_GOLD_API_KEY;
  const key2 = process.env.GOLD_API_KEY;
  const activeKey = key1 || key2 || null;

  res.status(200).json({
    status: "ok",
    VITE_GOLD_API_KEY: key1 ? `${key1.slice(0, 8)}... (found)` : "NOT SET",
    GOLD_API_KEY: key2 ? `${key2.slice(0, 8)}... (found)` : "NOT SET",
    activeKey: activeKey ? `${activeKey.slice(0, 8)}...` : "NONE — this is why Live is failing",
    fix: !activeKey
      ? "Go to Vercel → Project → Settings → Environment Variables → Add GOLD_API_KEY"
      : "Key is loaded. Check /api/gold for the actual API response.",
  });
}
