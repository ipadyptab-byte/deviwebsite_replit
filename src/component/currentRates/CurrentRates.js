import { useState, useEffect } from "react";
import { BsGraphUpArrow } from "react-icons/bs";
import borderLine from "../../images/border_line.png";
import "./CurrentRates.css";

const DEFAULT_RATES = {
  vedhani: "74,500",
  ornaments22K: "68,300",
  ornaments18K: "55,800",
  silver: "89,000",
};

const CurrentRates = () => {
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchRates = async () => {
    let data = null;

    // 1. Try live external rates endpoint
    try {
      const res = await fetch("/api/rates/live", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json && (json.vedhani || json.ornaments22K || json.ornaments18K || json.silver)) {
          data = json;
        }
      }
    } catch (err) {
      console.warn("Live rates fetch failed, trying fallback:", err);
    }

    // 2. If live failed, try stored database rates endpoint
    if (!data) {
      try {
        const res = await fetch("/api/rates", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json && (json.vedhani || json.ornaments22K || json.ornaments18K || json.silver)) {
            data = json;
          }
        }
      } catch (err) {
        console.warn("DB rates fetch failed:", err);
      }
    }

    // 3. Update rates state with received data or fall back gracefully
    if (data) {
      setRates({
        vedhani: data.vedhani || data['24K Gold'] || DEFAULT_RATES.vedhani,
        ornaments22K: data.ornaments22K || data.ornaments22k || data['22K Gold'] || DEFAULT_RATES.ornaments22K,
        ornaments18K: data.ornaments18K || data.ornaments18k || data['18K Gold'] || DEFAULT_RATES.ornaments18K,
        silver: data.silver || data['Silver'] || DEFAULT_RATES.silver,
      });
      if (data.updatedAt || data.updated_at) {
        setLastUpdated(new Date(data.updatedAt || data.updated_at));
      }
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDateTime = (date) => {
    if (!date) return "";
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRate = (val, defaultVal, defaultUnit = "/10gms") => {
    let s = (val !== null && val !== undefined && val !== 0 && val !== "0") ? String(val).trim() : defaultVal;
    if (!s) s = defaultVal;
    if (!s.startsWith("₹")) {
      s = `₹${s}`;
    }
    if (!s.includes("/")) {
      s = `${s}${defaultUnit}`;
    }
    return s;
  };

  return (
    <div className="icon_container">
      <span className="icon_wrapper">
        <BsGraphUpArrow />
      </span>
      <span className="title">Current Rates</span>

      <div className="tooltip">
        <h1>Today's Gold Rates</h1>
        <p className="rates-updated-at">Updated: {formatDateTime(lastUpdated)}</p>
        <div className="border-line">
          <img src={borderLine} alt="border line" />
        </div>
        <ul>
          <li className="rates">
            Vedhani <span>{formatRate(rates.vedhani, DEFAULT_RATES.vedhani, "/10gms")}</span>
          </li>
          <br />
          <li className="rates">
            22KT <span>{formatRate(rates.ornaments22K, DEFAULT_RATES.ornaments22K, "/10gms")}</span>
          </li>
          <br />
          <li className="rates">
            18KT <span>{formatRate(rates.ornaments18K, DEFAULT_RATES.ornaments18K, "/10gms")}</span>
          </li>
          <br />
          <li className="rates">
            Silver <span>{formatRate(rates.silver, DEFAULT_RATES.silver, "/10gms")}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CurrentRates;
