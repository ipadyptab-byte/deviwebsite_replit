import React, { useState, useEffect } from 'react';
import { BsGraphUpArrow } from 'react-icons/bs';
import borderLine from '../../images/border_line.png';
import './CurrentRates.css';

const CurrentRates = () => {
  const [rates, setRates] = useState({
    vedhani: "",
    ornaments22K: "",
    ornaments18K: "",
    silver: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('https://www.businessmantra.info/gold_rates/devi_gold_rate/api.php', {
          headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const raw = await response.json();

        setRates({
          vedhani: raw['24K Gold'] ?? '',
          ornaments22K: raw['22K Gold'] ?? '',
          ornaments18K: raw['18K Gold'] ?? '',
          silver: raw['Silver'] ?? '',
        });
      } catch (err) {
        console.error('Error fetching rates:', err);
        setError("Failed to load rates. Please try again later.");
      }
    };

    fetchRates();
  }, []);

  return (
    <div className="icon-container">
      <span className="icon-wrapper">
        <BsGraphUpArrow size={30} />
      </span>
      <span className="title">Current Rates</span>

      <div className="tooltip active">
        <h1>Today's Gold Rates</h1>
        <div className="border-line">
          <img src={borderLine} alt="border line" />
        </div>

        {error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <ul>
            <li>Vedhani: {rates.vedhani || "N/A"}</li>
            <li>22KT: {rates.ornaments22K || "N/A"}</li>
            <li>18KT: {rates.ornaments18K || "N/A"}</li>
            <li>Silver: {rates.silver || "N/A"}</li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default CurrentRates;
