// File: src/pages/DashboardPage.tsx

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// --- FIX: Replace 'SolarPanel' with the correct icon name 'LayoutGrid' ---
import { Zap, Sun, Activity, Clock, LucideIcon, LayoutGrid } from 'lucide-react'; 
import MetricCard from '../components/ui/MetricCard';
import GlassCard from '../components/ui/GlassCard';

// --- TypeScript Interfaces ---
interface Kpi {
  total_energy: string;
  avg_daily_output: string;
  peak_output: string;
  uptime: string;
}

interface EnergyPoint {
  date: string;
  energy: number;
}

interface Panel {
  id: string;
  output: string;
  status: 'Normal' | 'Warning' | 'Critical';
  x: number;
  y: number;
}

interface DashboardData {
  kpi: Kpi;
  energy_trend: EnergyPoint[];
  panel_layout: Panel[];
}

const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/dashboard-summary');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data from the server.');
        }
        const summaryData: DashboardData = await response.json();
        setData(summaryData);
      } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        }
        console.error("Error fetching dashboard data:", err);
      }
    };
    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Normal': return '#28a745';
      case 'Warning': return '#ffc107';
      case 'Critical': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (error) {
    return <GlassCard><div className="text-center text-red-500 p-8">Error: {error}</div></GlassCard>;
  }

  if (!data) {
    return <div>Loading Dashboard...</div>;
  }

  const kpiItems: { title: string; value: string; icon: LucideIcon }[] = [
    { title: 'Total Energy (kWh)', value: data.kpi.total_energy, icon: Zap },
    { title: 'Avg Daily Output (kWh)', value: data.kpi.avg_daily_output, icon: Sun },
    { title: 'Peak Output (kWh)', value: data.kpi.peak_output, icon: Activity },
    { title: 'System Uptime', value: data.kpi.uptime, icon: Clock },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiItems.map((kpi, index) => (
          <MetricCard
            key={index}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GlassCard title="Solar Farm Layout">
            <div className="relative h-96 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-100/30 to-blue-100/30"></div>
              
              {data.panel_layout.map((panel) => (
                <div
                  key={panel.id}
                  className="absolute group cursor-pointer"
                  style={{ left: `${panel.x}%`, top: `${panel.y}%` }}
                >
                  {/* --- FIX: Replace the non-existent icon with LayoutGrid --- */}
                  <LayoutGrid
                    className="w-8 h-8 transition-transform group-hover:scale-125"
                    style={{ color: getStatusColor(panel.status) }}
                    strokeWidth={1.5}
                  />
                  
                  <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {panel.id} | {panel.output}
                    <div 
                      className="absolute left-1/2 transform -translate-x-1/2 bottom-[-8px] w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-black/80">
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg z-0">
                <h4 className="font-medium text-[#002B5B] mb-2">Status</h4>
                <div className="space-y-1">
                    <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-[#28a745]"></div><span className="text-sm">Normal</span></div>
                    <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-[#ffc107]"></div><span className="text-sm">Warning</span></div>
                    <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-[#dc3545]"></div><span className="text-sm">Critical</span></div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        <div>
          <GlassCard title="Energy Output Over Time">
            <ResponsiveContainer width="100%" height={384}>
              <LineChart data={data.energy_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" stroke="#666" fontSize={10} tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="energy" 
                  stroke="#FF6B35" 
                  strokeWidth={3}
                  dot={{ fill: '#FF6B35', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;