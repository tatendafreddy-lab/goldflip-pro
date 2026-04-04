export default async function handler(req, res) {
  // Allow owner to pass a key per-request; fall back to project env var.
  const apiKey =
    req.headers["x-gold-key"] ||
    req.headers["x-access-token"] ||
    process.env.VITE_GOLD_API_KEY;

  if (!apiKey) {
    res.status(400).json({ error: "Missing Gold API key" });
    return;
  }

  try {
    const response = await fetch("https://www.gold-api.com/price/XAU", {
      headers: { "x-access-token": apiKey },
    });
    const data = await response.json();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
