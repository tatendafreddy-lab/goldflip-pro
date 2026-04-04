export default async function handler(req, res) {
  // Public endpoint: no key required. We keep header support but don't depend on it.
  const apiKey =
    req.headers["x-gold-key"] ||
    req.headers["x-access-token"] ||
    process.env.VITE_GOLD_API_KEY;

  try {
    const response = await fetch("https://api.gold-api.com/price/XAU", {
      headers: apiKey ? { "x-access-token": apiKey } : undefined,
    });
    const data = await response.json();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
