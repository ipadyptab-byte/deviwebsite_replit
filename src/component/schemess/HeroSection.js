import React from 'react';
import './HeroSection.scss';
// import backgroundImage from 'images/schemes/backgroundImage'; 

const HeroSection = () => {
  return (
    <div className="hero-section">
      <div className="overlay"> 
        <div className="content">
          <h1>Invest in Gold</h1>
          <p>Secure Your Future</p>
          <p>
            We, at Devi Jewellers keep running different schemes related to Gold purchase that help our customers financially to secure their future. Below is the list of such schemes running right now at our store/s. The list is always up to date.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
