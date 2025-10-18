import React, { useState, useEffect, useState } from 'react';
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
  });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const data = await ratesAPI.getRates();
        if (data) {
          setRates({
            vedhani: data.vedhani,
            ornaments22K: data.ornaments22K,
            ornaments18K: data.ornaments18K,
            silver: data.silver,
          });
        }
      } catch (error) {
        console.error('Error fetching rates:', error);
      }
    };
    fetchRates();
  }, []);

  return (
    <div 
      className="icon-container" 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="icon-wrapper">
        <BsGraphUpArrow size={30} />
        <span className="title">Current Rates</span>
      </div>

      {isHovered && (
        <div className="tooltip">
          <h1>Today's Gold Rates</h1>
          <div className="border-line">
            <img src={borderLine} alt="border line" />
          </div>
          <ul>
            <li>Vedhani: {rates.vedhani || 'N/A'}</li>
            <li>22KT: {rates.ornaments22K || 'N/A'}</li>
            <li>18KT: {rates.ornaments18K || 'N/A'}</li>
            <li>Silver: {rates.silver || 'N/A'}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default CurrentRates;
