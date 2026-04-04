export default async function handler(req, res) {
  const apiKey = process.env.VITE_GOLD_API_KEY;
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
