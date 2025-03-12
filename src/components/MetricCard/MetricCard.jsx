import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import styles from './MetricCard.module.css';

const MetricCard = ({ 
  icon, 
  label, 
  value, 
  change, 
  changeType = "increase", 
  colorScheme = "blue",
  period = "from last month" 
}) => {
  
  // Determine background color class based on colorScheme prop
  const getBgColorClass = () => {
    switch (colorScheme) {
      case "red": return styles.redBg;
      case "green": return styles.greenBg;
      case "blue": return styles.blueBg;
      case "purple": return styles.purpleBg;
      default: return styles.blueBg;
    }
  };
  
  // Determine icon color class based on colorScheme prop
  const getIconColorClass = () => {
    switch (colorScheme) {
      case "red": return styles.redIcon;
      case "green": return styles.greenIcon;
      case "blue": return styles.blueIcon;
      case "purple": return styles.purpleIcon;
      default: return styles.blueIcon;
    }
  };
  
  return (
    <div className={styles.card}>
      <div className={`${styles.iconContainer} ${getBgColorClass()}`}>
        {React.cloneElement(icon, { className: `${styles.icon} ${getIconColorClass()}` })}
      </div>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
      {change && (
        <div className={`${styles.changeIndicator} ${changeType === "increase" ? styles.increase : styles.decrease}`}>
          {changeType === "increase" ? (
            <ArrowUpRight className={styles.changeIcon} />
          ) : (
            <ArrowDownRight className={styles.changeIcon} />
          )}
          <span>{change}</span>
          <span className={styles.period}>{period}</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;