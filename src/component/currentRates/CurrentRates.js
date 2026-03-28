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
    const res = await fetch("/api/rates", { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Failed to fetch /api/rates: ${res.status}`);
    }

    const data = await res.json();
    setRates({
      vedhani: data.vedhani || "",
      ornaments22K: data.ornaments22K || "",
      ornaments18K: data.ornaments18K || "",
      silver: data.silver || "",
    });
    setUpdatedAt(data.updated_at || "");
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
