import { useState, useEffect } from "react";
import { BsGraphUpArrow } from "react-icons/bs";
import borderLine from "../../images/border_line.png";
import "./CurrentRates.css";

const API_URL = "https://www.businessmantra.info/gold_rates/devi_gold_rate/api.php";

const CurrentRates = () => {
  const [rates, setRates] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchRates = async () => {
    try {
      const res = await fetch(API_URL, {
        cache: "no-store",
        mode: "cors",
        credentials: "omit"
      });
      
      if (res.ok) {
        const data = await res.json();
        setRates({
          vedhani: data["24K Gold"] || 0,
          ornaments22K: data["22K Gold"] || 0,
          ornaments18K: data["18K Gold"] || 0,
          silver: data["Silver"] || 0,
        });
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch rates:", err);
    }
  };

  useEffect(() => {
    // Fetch immediately on mount
    fetchRates();

    // Refresh every 30 seconds
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
      second: "2-digit",
    });
  };

  // If no rates yet, don't show anything (no N/A, no loading text)
  if (!rates) {
    return (
      <div className="icon_container">
        <span className="icon_wrapper">
          <BsGraphUpArrow />
        </span>
        <span className="title">Current Rates</span>
        <div className="tooltip">
          <h1>Today's Gold Rates</h1>
          <p className="rates-updated-at">Loading...</p>
          <div className="border-line">
            <img src={borderLine} alt="border line" />
          </div>
        </div>
      </div>
    );
  }

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
            Vedhani <span>₹{rates.vedhani}/10gms</span>
          </li>
          <br />
          <li className="rates">
            22KT <span>₹{rates.ornaments22K}/10gms</span>
          </li>
          <br />
          <li className="rates">
            18KT <span>₹{rates.ornaments18K}/10gms</span>
          </li>
          <br />
          <li className="rates">
            Silver <span>₹{rates.silver}/g</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CurrentRates;
