import React, { useState, useEffect } from 'react';
import { BsGraphUpArrow } from 'react-icons/bs';
import { ratesAPI } from '../../api/client';
import borderLine from '../../images/border_line.png';
import './CurrentRates.css';

const CurrentRates = () => {
  const [rates, setRates] = useState({
    vedhani: "",
    ornaments22K: "",
    ornaments18K: "",
    silver: "",
    updatedAt: "",
    source: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      setIsLoading(true);
      try {
        const data = await ratesAPI.getRates();
        if (data) {
          setRates({
            vedhani: data.vedhani,
            ornaments22K: data.ornaments22k,
            ornaments18K: data.ornaments18k,
            silver: data.silver,
            updatedAt: data.updatedAt || "",
            source: data.source || "",
          });
        } else {
          console.log("No rates found!");
        }
      } catch (error) {
        console.error("Error fetching rates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRates();

    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatDateTime = (iso) => {
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return "";
      return d.toLocaleString();
    } catch {
      return "";
    }
  };

  return (
    <div className="icon_container">
      <span className="icon_wrapper">
        <BsGraphUpArrow />
      </span>
      <span className="title">Current Rates</span>

      <div className="tooltip">
        <h1>Today's Metal Rates</h1>
        <div style={{ textAlign: 'center', fontSize: '12px', color: '#555', marginTop: '6px' }}>
          {isLoading ? (
            <span style={{ fontStyle: 'italic' }}>Loading rates...</span>
          ) : rates.updatedAt ? (
            `Last updated: ${formatDateTime(rates.updatedAt)}`
          ) : (
            ''
          )}
        </div>
        <div className='border-line'>
          <img src={borderLine} alt='border line'/>
        </div>
        <h1>Rate Per 10 Gms</h1>
        {isLoading && !rates.vedhani ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            <p>Fetching latest rates...</p>
          </div>
        ) : (
          <ul>
            <li className='rates'>Vedhani 24KT  <span>₹{rates.vedhani || "N/A"}</span></li><br/>
            <li className='rates'> Gold 22KT <span>₹{rates.ornaments22K || "N/A"}</span></li><br/>
            <li className='rates'>Gold 18KT <span>₹{rates.ornaments18K || "N/A"}</span></li><br/>
            <li className='rates'>Silver <span>₹{rates.silver || "N/A"}</span></li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default CurrentRates;
