export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Try both env variable names — Vercel sometimes strips VITE_ prefix
  const apiKey =
    process.env.VITE_GOLD_API_KEY ||
    process.env.GOLD_API_KEY ||
    "";

  if (!apiKey) {
    return res.status(500).json({
      error: "API key not configured",
      hint: "Add GOLD_API_KEY to Vercel environment variables (Settings → Environment Variables)",
      tried: ["VITE_GOLD_API_KEY", "GOLD_API_KEY"],
    });
  }

  // Try multiple endpoints — Gold-API has inconsistent subdomain docs
  const endpoints = [
    "https://www.gold-api.com/price/XAU",
    "https://gold-api.com/price/XAU",
    "https://api.gold-api.com/price/XAU",
  ];

  let lastError = null;

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        headers: {
          "x-access-token": apiKey,
          "Content-Type": "application/json",
        },
      });

      const text = await response.text();
      console.log(`[gold.js] ${url} → ${response.status}: ${text.slice(0, 200)}`);

      if (!response.ok) {
        lastError = `${url} returned ${response.status}: ${text.slice(0, 100)}`;
        continue;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        lastError = `${url} returned invalid JSON: ${text.slice(0, 100)}`;
        continue;
      }

      // Normalise response — always return { price: number }
      const price =
        typeof data.price === "number" ? data.price :
        typeof data.value === "number" ? data.value :
        typeof data.XAU === "number" ? data.XAU :
        null;

      if (!price || price <= 0) {
        lastError = `${url} returned no valid price: ${JSON.stringify(data).slice(0, 100)}`;
        continue;
      }

      // Success
      return res.status(200).json({
        price,
        source: url,
        raw: data,
        timestamp: Date.now(),
      });

    } catch (err) {
      lastError = `${url} threw: ${err.message}`;
      continue;
    }
  }

  // All endpoints failed
  return res.status(502).json({
    error: "All Gold-API endpoints failed",
    lastError,
    keyConfigured: !!apiKey,
    keyPreview: apiKey.slice(0, 8) + "...",
  });
}
