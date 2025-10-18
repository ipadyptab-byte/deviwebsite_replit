import React, { useState, useEffect } from 'react';
import { BsGraphUpArrow } from 'react-icons/bs';
import borderLine from '../../images/border_line.png';
import './CurrentRates.css';

const CurrentRates = () => {
  const [rates, setRates] = useState({
    vedhani: '',
    ornaments22K: '',
    ornaments18K: '',
    silver: '',
  });

  const [error, setError] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('/api/rates/live', {
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) throw new Error('Fetch failed');
        const data = await response.json();
        setRates({
          vedhani: data.vedhani || 'N/A',
          ornaments22K: data.ornaments22K || 'N/A',
          ornaments18K: data.ornaments18K || 'N/A',
          silver: data.silver || 'N/A',
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load rates.');
      }
    };

    fetchRates();
  }, []);

  return (
    <div
      className="icon-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: 'pointer', position: 'relative' }}
    >
      <span className="icon-wrapper">
        <BsGraphUpArrow size={30} />
      </span>
      <span className="title">Current Rates</span>

      {isHovered && (
        <div
          className="tooltip"
          style={{
            position: 'absolute',
            top: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#fff',
            color: '#000',
            padding: '10px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            zIndex: 20,
            width: 220,
          }}
        >
          <h1>Today's Gold Rates</h1>
          <div className="border-line">
            <img src={borderLine} alt="border line" />
          </div>
          {error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : (
            <ul>
              <li>Vedhani: {rates.vedhani}</li>
              <li>22KT: {rates.ornaments22K}</li>
              <li>18KT: {rates.ornaments18K}</li>
              <li>Silver: {rates.silver}</li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default CurrentRates;
