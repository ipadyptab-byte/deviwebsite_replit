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
  const [createdAt, setCreatedAt] = useState("");

  const fetchRates = async () => {
    const tryFetch = async (url) => {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return null;
      return res.json();
    };

    // Use Vercel rewrite proxy to avoid browser CORS issues.
    // /displayrates/* -> https://tv-rate-display.vercel.app/*
    const proxied = encodeURIComponent(
      "https://tv-rate-display.vercel.app/api/rates/sync"
    );
    const corsWrapper = `https://api.allorigins.win/raw?url=${proxied}`;

    const data =
      (await tryFetch("/displayrates/api/rates/sync")) ||
      (await tryFetch("https://tv-rate-display.vercel.app/api/rates/sync")) ||
      (await tryFetch(corsWrapper));

    if (!data) {
      throw new Error("Failed to fetch rates");
    }

    const r = data?.rates || {};

    const silverPerGramSale =
      typeof r.silver_per_kg_sale === "number"
        ? (r.silver_per_kg_sale / 1000).toFixed(2)
        : "";

    setRates({
      vedhani: r.gold_24k_sale ?? "",
      ornaments22K: r.gold_22k_sale ?? "",
      ornaments18K: r.gold_18k_sale ?? "",
      silver: silverPerGramSale,
    });

    setCreatedAt(r.created_date || "");
  };

  useEffect(() => {
    fetchRates().catch((err) => {
      console.error("❌ Failed to fetch rates:", err);
    });

    // Refresh every 30s
    const interval = setInterval(() => {
      fetchRates().catch((err) => {
        console.error("❌ Failed to fetch rates:", err);
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const updatedAtLabel = createdAt ? new Date(createdAt).toLocaleString() : "N/A";

  return (
    <div className="icon_container">
      <span className="icon_wrapper">
        <BsGraphUpArrow />
      </span>
      <span className="title">Current Rates</span>

      <div className="tooltip">
        <h1>Today's Gold Rates</h1>
        <p className="rates-updated-at">Updated: {updatedAtLabel}</p>
        <div className="border-line">
          <img src={borderLine} alt="border line" />
        </div>
        <ul>
          <li className="rates">
            Vedhani <span>₹{rates.vedhani || "N/A"}/10gms</span>
          </li>
          <br />
          <li className="rates">
            22KT <span>₹{rates.ornaments22K || "N/A"}/10gms</span>
          </li>
          <br />
          <li className="rates">
            18KT <span>₹{rates.ornaments18K || "N/A"}/10gms</span>
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
