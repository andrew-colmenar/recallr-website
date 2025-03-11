import React from "react";

const MetricCard = ({ title, value, description, icon, iconBg, footer }) => {
  return (
    <div className="bg-[#1a1a1a] rounded-md border border-[#2a2a2a] p-4">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm text-gray-400">{title}</h3>
        <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center`}>{icon}</div>
      </div>
      <div className="mb-2">
        <div className="text-4xl font-semibold">{value}</div>
      </div>
      <div className="text-xs text-gray-400">{description}</div>
      {footer && <div className="mt-2">{footer}</div>}
    </div>
  );
};

export default MetricCard;