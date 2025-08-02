import React from 'react';
import './FeatureButton.css';

const FeatureButton = ({ title, sub, onClick }) => {
  return (
    <div className="feature-button" onClick={onClick}>
      <div className="feature-title">{title}</div>
      {sub && <div className="feature-sub">{sub}</div>}
    </div>
  );
};

export default FeatureButton;
