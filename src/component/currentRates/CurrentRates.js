import React, { useState, useEffect } from "react";
import { BsGraphUpArrow } from "react-icons/bs";
import borderLine from "../../images/border_line.png";
import "./CurrentRates.css";

const CurrentRates = () => {
  const [rates, setRates] = useState({
    vedhani: "",
    ornaments22K: "",
    ornaments18K: "",
    silver: "",
  });
  const [updatedAt, setUpdatedAt] = useState("");

  const fetchRatesFromDb = async () => {
    const tryFetch = async (url) => {
      const res = await fetch(url, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return null;
      return res.json();
    };

    const fetchExternal = async () => {
      const externalUrl = encodeURIComponent(
        "https://www.businessmantra.info/gold_rates/devi_gold_rate/api.php"
      );
      const corsWrapper = `https://api.allorigins.win/get?url=${externalUrl}`;
      const res = await fetch(corsWrapper, { cache: "no-store" });
      if (!res.ok) return null;
      const wrapped = await res.json();
      try {
        return JSON.parse(wrapped.contents);
      } catch {
        return null;
      }
    };

    // 1) Local /api (same deployment)
    // 2) Fallback to tv-rate-display project via Vercel rewrite (/displayrates -> tv-rate-display.vercel.app)
    // 3) Direct tv-rate-display endpoint
    // 4) Live proxy
    // 5) Last-resort: external via CORS wrapper
    const data =
      (await tryFetch("/api/rates")) ||
      (await tryFetch("/displayrates/api/rates")) ||
      (await tryFetch("https://tv-rate-display.vercel.app/api/rates")) ||
      (await tryFetch("https://tv-rate-display.vercel.app/api/rates/live")) ||
      (await tryFetch("/api/rates/live")) ||
      (await fetchExternal());

    

    if (!data) {
      throw new Error("Failed to fetch rates from any source");
    }

    const normalizeCurrencyValue = (v) => {
      if (v === null || v === undefined) return "";
      if (typeof v === "number") return String(v);
      const s = String(v).trim();
      if (!s) return "";
      return s.replace(/[,\s]/g, "");
    };

    setRates({
      vedhani: normalizeCurrencyValue(data.vedhani || data["24K Gold"]),
      ornaments22K: normalizeCurrencyValue(
        data.ornaments22K || data.ornaments22k || data["22K Gold"]
      ),
      ornaments18K: normalizeCurrencyValue(
        data.ornaments18K || data.ornaments18k || data["18K Gold"]
      ),
      silver: normalizeCurrencyValue(data.silver || data["Silver"]),
    });

    const updated = data.updated_at || data.updatedAt || "";
    setUpdatedAt(updated || new Date().toISOString());
  };

  useEffect(() => {
    fetchRatesFromDb().catch((err) => {
      console.error("❌ Failed to fetch rates from DB:", err);
    });

    // Refresh every 30s
    const interval = setInterval(() => {
      fetchRatesFromDb().catch((err) => {
        console.error("❌ Failed to fetch rates from DB:", err);
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const updatedAtLabel = updatedAt
    ? new Date(updatedAt).toLocaleString()
    : "N/A";

  return (
    <div className="icon_container">
      <span className="icon_wrapper">
        <BsGraphUpArrow />
      </span>
      <span className="title">Current Rates</span>

      <div className="tooltip">
        <h1>Today's Gold Rates</h1>
        <p className="rates-updated-at">Last updated: {updatedAtLabel}</p>
        <div className="border-line">
          <img src={borderLine} alt="border line" />
        </div>
        <ul>
          <li className="rates">
            Vedhani <span>₹{rates.vedhani || "N/A"}</span>
          </li>
          <br />
          <li className="rates">
            22KT <span>₹{rates.ornaments22K || "N/A"}</span>
          </li>
          <br />
          <li className="rates">
            18KT <span>₹{rates.ornaments18K || "N/A"}</span>
          </li>
          <br />
          <li className="rates">
            Silver <span>₹{rates.silver || "N/A"}/g</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CurrentRates;
