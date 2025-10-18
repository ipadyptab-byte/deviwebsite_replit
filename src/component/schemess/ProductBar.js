import React from 'react';
import './ProductBar.scss';

const ProductBar = () => {
  return (
    <div className="product-bar">
      <div className="product-item">
        <img src="/images/schemes/diamond_ring.png" alt="Diamond Rings" />
        <p>Diamond Rings</p>
      </div>
      <div className="product-item">
        <img src="/images/schemes/Earings.png" alt="Earrings" />
        <p>Earrings</p>
      </div>
      <div className="product-item">
        <img src="/images/schemes/Necklaces.png" alt="Necklaces" />
        <p>Necklaces</p>
      </div>
    </div>
  );
};

export default ProductBar;
