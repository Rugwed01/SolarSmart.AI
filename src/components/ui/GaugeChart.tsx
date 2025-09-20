// File: src/components/ui/GaugeChart.tsx
import React from 'react';

interface GaugeChartProps {
  value: number;
  max: number;
  color: string;
  title: string;
  unit: string;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ value, max, color, title, unit }) => {
  const percentage = Math.min(100, (value / max) * 100);
  const circumference = 2 * Math.PI * 45; // r = 45
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <div className="text-center">
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="transparent"
            className="transform-origin-center"
          />
          <circle
            cx="50%"
            cy="50%"
            r="45"
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transform-origin-center transition-all duration-500 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div>
            <div className="text-2xl font-bold text-[#002B5B]">{Math.round(value)}</div>
            <div className="text-xs text-gray-500">{unit}</div>
          </div>
        </div>
      </div>
      <h3 className="font-medium text-[#002B5B]">{title}</h3>
    </div>
  );
};

export default GaugeChart;