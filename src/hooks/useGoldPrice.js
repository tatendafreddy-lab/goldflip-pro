// ...imports and helpers unchanged...

export function useGoldPrice(apiKey, mode = "live") {
  // state setup unchanged ...

  useEffect(() => {
    // ...helpers unchanged...

    const fetchPrice = async () => {
      // ...cache handling unchanged...

      try {
        if (!cancelled) setIsLoading(true);

        const response = await axios.get(API_URL, {
          timeout: 8000,
          headers: apiKey ? { "x-gold-key": apiKey } : undefined,
          validateStatus: () => true, // inspect non-200
        });

        console.log("[useGoldPrice] Raw response:", response.status, response.data);

        if (response.status !== 200) {
          console.error("[useGoldPrice] Non-200 response body:", response.data);
          throw new Error(`HTTP ${response.status}`);
        }

        const latestPrice = parsePrice(response.data);
        if (!Number.isFinite(latestPrice) || latestPrice <= 0) {
          throw new Error(
            `Unexpected response shape: ${JSON.stringify(response.data).slice(0, 120)}`
          );
        }

        if (!cancelled) {
          // ...state updates unchanged...
        }
      } catch (err) {
        console.error("[useGoldPrice] Fetch failed:", err.message, err?.response?.data);
        // ...cache fallback and demo fallback unchanged...
      }
    };

    // ...rest unchanged...
