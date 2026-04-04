export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  if (req.method === "OPTIONS") return res.status(200).end();

  const apiKey = process.env.VITE_GOLD_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "API key not configured",
      hint: "Add VITE_GOLD_API_KEY to Vercel environment variables",
    });
  }

  try {
    // JSON endpoint (no “www”)
    const response = await fetch("https://api.gold-api.com/price/XAU", {
      headers: { "x-access-token": apiKey },
    });
    const text = await response.text();
    console.log("Gold-API raw response:", text);
    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch (parseErr) {
      console.error("Gold-API JSON parse error:", parseErr.message);
      return res
        .status(500)
        .json({ error: "Invalid JSON from Gold-API", body: text.slice(0, 500) });
    }
  } catch (err) {
    console.error("Gold-API error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
