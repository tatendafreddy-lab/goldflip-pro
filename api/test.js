export default function handler(req, res) {
  res.status(200).json({
    status: "ok",
    hasKey: !!process.env.VITE_GOLD_API_KEY,
    keyPreview: process.env.VITE_GOLD_API_KEY
      ? `${process.env.VITE_GOLD_API_KEY.slice(0, 8)}...`
      : null,
  });
}
