// File: src/components/ui/MetricCard.tsx

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import GlassCard from './GlassCard';

// Step 1: Define the props for this component.
// We add a '?' to make 'change' and 'changeType' optional.
interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  change?: string; // This prop is now OPTIONAL
  changeType?: 'positive' | 'negative'; // This prop is also OPTIONAL
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, change, changeType }) => {
  const isPositive = changeType === 'positive';
  
  return (
    <GlassCard>
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-[#FF6B35]/10 rounded-lg">
          <Icon className="w-6 h-6 text-[#FF6B35]" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <p className="text-2xl font-bold text-[#002B5B]">{value}</p>
        </div>
      </div>
      
      {/* Step 2: Only render the 'change' element IF the 'change' prop was provided. */}
      {change && (
        <div className="flex items-center space-x-1 mt-3 text-sm">
          {changeType && (
            isPositive 
              ? <ArrowUpRight className="w-4 h-4 text-green-500" /> 
              : <ArrowDownRight className="w-4 h-4 text-red-500" />
          )}
          <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
            {change}
          </span>
          <span className="text-gray-500"></span>
        </div>
      )}
    </GlassCard>
  );
};

export default MetricCard;