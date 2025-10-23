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
  });

  useEffect(() => {
  const fetchRates = async () => {
    try {
      const data = await ratesAPI.getRates();
      if (data) {
        setRates({
          vedhani: data.vedhani,
          ornaments22K: data.ornaments22k,
          ornaments18K: data.ornaments18k,
          silver: data.silver,
        });
      } else {
        console.log("No rates found!");
      }
    } catch (error) {
      console.error("Error fetching rates:", error);
    }
  };

  fetchRates();
}, []);



  return (
    <div className="icon_container">
      <span className="icon_wrapper">
        <BsGraphUpArrow />
      </span>  
      <span className="title">Current Rates</span> 

      <div className="tooltip">
        <h1>Today's Gold Rates</h1>
        <div className='border-line'>
        <img src={borderLine} alt='border line'/>
        </div>
        <ul>
          <li className='rates'>Vedhani  <span>₹{rates.vedhani || "N/A"}</span></li><br/>
          <li className='rates'> Gold 22KT <span>₹{rates.ornaments22K || "N/A"}</span></li><br/>
          <li className='rates'>Gold 18KT <span>₹{rates.ornaments18K || "N/A"}</span></li><br/>
          <li className='rates'>Silver <span>₹{rates.silver || "N/A"}</span></li>
        </ul>
      </div>
    </div>
  );
};

export default CurrentRates;
