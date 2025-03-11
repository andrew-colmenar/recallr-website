import React from "react";
import "../../styles/MetricCard.css";

const MetricCard = ({ title, value, description, icon, iconBg, footer }) => {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <h3 className="metric-title">{title}</h3>
        <div className={`metric-icon ${iconBg}`}>{icon}</div>
      </div>
      <div className="metric-value-container">
        <div className="metric-value">{value}</div>
      </div>
      <div className="metric-description">{description}</div>
      {footer && <div className="metric-footer">{footer}</div>}
    </div>
  );
};

export default MetricCard;