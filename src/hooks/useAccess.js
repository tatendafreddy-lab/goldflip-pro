import { useEffect, useState } from "react";
import { isValidCode } from "../utils/accessCodes.js";

const STORAGE_KEY = "goldflip-access-code";

export function useAccess() {
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && isValidCode(saved)) {
        setIsPro(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const activateCode = (code) => {
    if (!isValidCode(code)) return false;
    try {
      localStorage.setItem(STORAGE_KEY, code.trim().toUpperCase());
    } catch {
      /* ignore */
    }
    setIsPro(true);
    return true;
  };

  const removeCode = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setIsPro(false);
  };

  return { isPro, activateCode, removeCode };
}
