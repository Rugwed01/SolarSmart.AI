// File: src/components/ui/WeatherCharts.tsx

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import GlassCard from './GlassCard'; // NOTE: Make sure this path is correct for your project

// Define a "blueprint" for a single point of weather data
interface WeatherPoint {
  date: string;
  temperature: number;
  irradiance: number;
  humidity: number;
  cloud_cover: number;
}

// FIX: Renamed to WeatherChartsProps (plural)
interface WeatherChartsProps {
  data: WeatherPoint[];
}

// This is the small, reusable chart component defined locally
const MiniWeatherChart: React.FC<{
  data: WeatherPoint[];
  dataKey: keyof WeatherPoint;
  title: string;
  color: string;
  unit: string;
}> = ({ data, dataKey, title, color, unit }) => (
  <GlassCard title={title}>
    <ResponsiveContainer width="100%" height={120}>
      <LineChart 
        data={data}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
      >
        <XAxis 
          dataKey="date" 
          fontSize={10} 
          tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { day: 'numeric' })} 
        />
        <YAxis fontSize={10} />
        <Tooltip 
          formatter={(value: number) => [`${value.toFixed(1)} ${unit}`, title]}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            fontSize: '12px'
          }}
        />
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          stroke={color} 
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </GlassCard>
);

// FIX: Renamed the main component to WeatherCharts (plural)
const WeatherCharts: React.FC<WeatherChartsProps> = ({ data }) => {
  if (!data || data.length === 0) {
      return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MiniWeatherChart data={data} dataKey="temperature" title="Temperature (°C)" color="#FF6B35" unit="°C" />
      <MiniWeatherChart data={data} dataKey="irradiance" title="Irradiance (W/m²)" color="#FFD700" unit="W/m²" />
      <MiniWeatherChart data={data} dataKey="humidity" title="Humidity (%)" color="#00BFFF" unit="%" />
      <MiniWeatherChart data={data} dataKey="cloud_cover" title="Cloud Cover (%)" color="#9CA3AF" unit="%" />
    </div>
  );
};

// FIX: Export the plural name to match the filename
export default WeatherCharts;