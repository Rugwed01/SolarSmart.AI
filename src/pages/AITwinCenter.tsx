// File: src/pages/AITwinCenterPage.tsx

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { MapPin, Zap, Phone, Car, CloudLightning, Thermometer, Droplets, ChevronsDown, ChevronsUp, Activity, AlertTriangle, RefreshCw } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import GaugeChart from '../components/ui/GaugeChart';
import { useCity } from '../context/CityContext';

// --- TypeScript Interfaces for our API Data ---
interface LiveMetrics { voltage: number; current: number; temperature: number; humidity: number; timestamp: string; }
interface RawReading { created_at: string; voltage: number; current: number; power: number; temperature: number; }
interface AITwinSummary {
  city: string;
  live_metrics: LiveMetrics;
  live_power_trend: { time: string; actual: number }[];
  prediction: { predicted_power_mw: number; };
  performance: { power_difference_mw: number; percent_difference: number; est_revenue_loss: number; };
  impact: { phones_charged_per_hour: number; ev_range_added_per_hour_km: number; co2_avoided_grams_today: number; };
  forecast_7_day: { date: string; predicted_power_mw: number }[];
  raw_readings: RawReading[];
}

const AITwinCenterPage: React.FC = () => {
  const { activeCity } = useCity();
  const [summary, setSummary] = useState<AITwinSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!activeCity) return;
      
      // It's a background refresh if we already have data
      if (summary !== null) {
        setIsRefreshing(true);
      }
      
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/ai-twin-summary/${activeCity}`);
        if (!response.ok) throw new Error('Failed to fetch AI Twin data');
        const data: AITwinSummary = await response.json();
        setSummary(data);
        setError(null);
      } catch (e) {
        setError("Failed to fetch data. Is the backend running?");
        console.error(e);
      } finally {
        setIsRefreshing(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Auto-refresh logic
    return () => clearInterval(interval);
  }, [activeCity]);

  if (error) return <GlassCard><div className="text-center text-red-500 p-8">{error}</div></GlassCard>;
  if (!summary) return <div>Loading Command Center for {activeCity}...</div>;

  const livePowerTrend = summary.live_power_trend.slice(-30).map(d => ({
      time: new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}),
      "Actual Power (mW)": d.actual * 1000,
      "AI Predicted (mW)": summary.prediction.predicted_power_mw
  }));

  const forecastChartData = summary.forecast_7_day.map(d => ({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      'Predicted Power (mW)': parseFloat(d.predicted_power_mw.toFixed(1)),
  }));

  const latestActualPower = summary.raw_readings.length > 0 ? summary.raw_readings[0].power * 1000 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-[#FF6B35]" />
            <h1 className="text-2xl font-bold text-[#002B5B]">AI Twin Command Center: {summary.city}</h1>
        </div>
        
        {isRefreshing && (
          <div className="flex items-center text-gray-500 text-sm animate-pulse">
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              <span>Updating...</span>
          </div>
        )}

        {summary.performance.percent_difference > 15 && !isRefreshing && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Performance Warning</span>
            </div>
        )}
      </div>

      {/* Live Power Comparison Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard><GaugeChart value={latestActualPower} max={150} color="#FFB703" title="Actual Power" unit="mW"/></GlassCard>
        <GlassCard><GaugeChart value={summary.prediction.predicted_power_mw} max={150} color="#00BFFF" title="AI Predicted Power" unit="mW"/></GlassCard>
      </div>

      {/* Detailed Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard title="Live Metrics"><p className="text-lg flex items-center"><Zap className="w-5 h-5 mr-2 text-yellow-500"/><strong>Voltage:</strong><span className="ml-auto font-mono">{summary.live_metrics.voltage?.toFixed(2) ?? 'N/A'} V</span></p><p className="text-lg flex items-center"><Activity className="w-5 h-5 mr-2 text-blue-500"/><strong>Current:</strong><span className="ml-auto font-mono">{summary.live_metrics.current?.toFixed(2) ?? 'N/A'} mA</span></p></GlassCard>
          <GlassCard title="Environment"><p className="text-lg flex items-center"><Thermometer className="w-5 h-5 mr-2 text-red-500" /><strong>Temp:</strong><span className="ml-auto font-mono">{summary.live_metrics.temperature?.toFixed(1) ?? 'N/A'} °C</span></p><p className="text-lg flex items-center"><Droplets className="w-5 h-5 mr-2 text-cyan-500" /><strong>Humidity:</strong><span className="ml-auto font-mono">{summary.live_metrics.humidity?.toFixed(1) ?? 'N/A'} %</span></p></GlassCard>
          <GlassCard title="Performance Analysis"><p className="text-lg flex items-center"><CloudLightning className="w-5 h-5 mr-2 text-purple-500" /><strong>Power Diff:</strong><span className="ml-auto font-mono">{summary.performance.power_difference_mw?.toFixed(2) ?? 'N/A'} mW</span></p><p className="text-lg flex items-center"><strong>% Difference:</strong><span className="ml-auto font-mono">{summary.performance.percent_difference?.toFixed(1) ?? 'N/A'} %</span></p><p className="text-lg flex items-center"><strong>Revenue Loss:</strong><span className="ml-auto font-mono">₹{summary.performance.est_revenue_loss?.toFixed(2) ?? 'N/A'}</span></p></GlassCard>
          <GlassCard title="Full-Scale Impact (AI Est.)"><p className="text-lg flex items-center"><Phone className="w-5 h-5 mr-2 text-green-500" /><strong>Phones/hr:</strong><span className="ml-auto font-mono">{summary.impact.phones_charged_per_hour?.toFixed(1) ?? 'N/A'}</span></p><p className="text-lg flex items-center"><Car className="w-5 h-5 mr-2 text-gray-700" /><strong>EV Range/hr:</strong><span className="ml-auto font-mono">{summary.impact.ev_range_added_per_hour_km?.toFixed(1) ?? 'N/A'} km</span></p></GlassCard>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <GlassCard title="Live & Predicted Power Trend"><ResponsiveContainer width="100%" height={300}><LineChart data={livePowerTrend}><CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" /><XAxis dataKey="time" stroke="#666" fontSize={12} /><YAxis stroke="#666" fontSize={12} domain={[0, 'auto']}/><Tooltip /><Legend /><Line type="monotone" dataKey="Actual Power (mW)" stroke="#FFB703" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="AI Predicted (mW)" stroke="#00BFFF" strokeWidth={2} strokeDasharray="5 5" dot={false} /></LineChart></ResponsiveContainer></GlassCard>
        </div>
        <div className="lg:col-span-2">
          <GlassCard title="7-Day Power Forecast"><ResponsiveContainer width="100%" height={300}><BarChart data={forecastChartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Legend /><Bar dataKey="Predicted Power (mW)" fill="#8884d8" /></BarChart></ResponsiveContainer></GlassCard>
        </div>
      </div>
      
      <GlassCard>
        <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsTableExpanded(!isTableExpanded)}>
          <h2 className="text-lg font-semibold text-[#002B5B]">Raw Recent Readings</h2>
          {isTableExpanded ? <ChevronsUp /> : <ChevronsDown />}
        </div>
        {isTableExpanded && (
          <div className="overflow-x-auto mt-4"><table className="w-full text-sm text-left"><thead className="bg-gray-50"><tr><th className="px-4 py-2">Timestamp</th><th className="px-4 py-2 text-right">Power (W)</th><th className="px-4 py-2 text-right">Voltage (V)</th><th className="px-4 py-2 text-right">Current (A)</th><th className="px-4 py-2 text-right">Temp (°C)</th></tr></thead>
            <tbody>{summary.raw_readings.slice(0, 10).map((row) => (<tr key={row.created_at} className="border-b"><td className="px-4 py-2 font-mono">{new Date(row.created_at).toLocaleString()}</td><td className="px-4 py-2 text-right font-semibold">{row.power.toFixed(4)}</td><td className="px-4 py-2 text-right">{row.voltage.toFixed(2)}</td><td className="px-4 py-2 text-right">{row.current.toFixed(4)}</td><td className="px-4 py-2 text-right">{row.temperature.toFixed(2)}</td></tr>))}</tbody>
          </table></div>
        )}
      </GlassCard>
    </div>
  );
};

export default AITwinCenterPage;