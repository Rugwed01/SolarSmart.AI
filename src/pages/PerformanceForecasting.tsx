// File: src/pages/PerformanceForecastingPage.tsx

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin, Zap } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import WeatherCharts from '../components/ui/WeatherCharts';
import { useCity } from '../context/CityContext';

// --- TypeScript Interfaces for our API Data ---
interface WeatherPoint { date: string; temperature: number; irradiance: number; humidity: number; cloud_cover: number; }
interface EnergyPoint { date: string; predicted_output_kwh: number; }
interface ForecastData { location: string; weather_data: WeatherPoint[]; energy_forecast: EnergyPoint[]; }

const PerformanceForecastingPage: React.FC = () => {
  const { setActiveCity } = useCity();
  
  const [cityInput, setCityInput] = useState('Mumbai');
  const [forecastDays, setForecastDays] = useState(7);
  const [panelCapacity, setPanelCapacity] = useState(5.0);
  const [panelEfficiency, setPanelEfficiency] = useState(18.5);
  
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateForecast = async () => {
    setIsLoading(true);
    setError('');
    setForecastData(null);

    const forecastPayload = {
      location: cityInput,
      forecast_days: forecastDays,
      panel_capacity: panelCapacity,
      panel_efficiency: panelEfficiency
    };

    try {
      // Logic to retrain model and get forecast
      const retrainResponse = await fetch('http://127.0.0.1:8000/api/retrain-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: cityInput })
      });
      if (!retrainResponse.ok) throw new Error('Failed to retrain AI model.');
      
      setActiveCity(cityInput);
      
      const forecastResponse = await fetch('http://127.0.0.1:8000/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(forecastPayload)
      });
      if (!forecastResponse.ok) {
        const errorBody = await forecastResponse.json();
        const detail = errorBody.detail;
        if (typeof detail === 'object') {
          throw new Error(`Failed to generate forecast: ${JSON.stringify(detail)}`);
        } else {
          throw new Error(`Failed to generate forecast: ${detail || forecastResponse.statusText}`);
        }
      }

      const data: ForecastData = await forecastResponse.json();
      setForecastData(data);
    
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : "An unknown error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard title="Forecast Parameters">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#002B5B] mb-2"><MapPin className="w-4 h-4 inline mr-1" />Enter a City</label>
            <input type="text" value={cityInput} onChange={(e) => setCityInput(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent" placeholder="Mumbai"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#002B5B] mb-2">Forecast Days: {forecastDays}</label>
            <input type="range" min="1" max="16" value={forecastDays} onChange={(e) => setForecastDays(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
            <div className="flex justify-between text-xs text-gray-500 mt-1"><span>1</span><span>16</span></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#002B5B] mb-2">Panel Capacity: {panelCapacity.toFixed(1)} kW</label>
            <input type="range" min="1" max="10" step="0.1" value={panelCapacity} onChange={(e) => setPanelCapacity(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
            <div className="flex justify-between text-xs text-gray-500 mt-1"><span>1 kW</span><span>10 kW</span></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#002B5B] mb-2">Panel Efficiency: {panelEfficiency.toFixed(1)}%</label>
            <input type="range" min="15" max="25" step="0.1" value={panelEfficiency} onChange={(e) => setPanelEfficiency(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
            <div className="flex justify-between text-xs text-gray-500 mt-1"><span>15%</span><span>25%</span></div>
          </div>
        </div>
        <div className="mt-6">
          <button onClick={handleGenerateForecast} disabled={isLoading} className="flex items-center px-6 py-3 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF6B35]/80 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed">
            <Zap className="w-4 h-4 mr-2" />
            {isLoading ? 'Retraining & Forecasting...' : 'Generate Forecast & Retrain AI'}
          </button>
        </div>
      </GlassCard>
      
      {isLoading && <div className="text-center font-medium text-[#002B5B]">Retraining model and generating forecast...</div>}
      {error && <GlassCard><p className="p-4 text-red-600 text-center font-medium">{error}</p></GlassCard>}
      
      {forecastData && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <WeatherCharts data={forecastData.weather_data} />
          </div>
          <div>
            <GlassCard title={`Predicted Daily Energy Output (kWh) for ${forecastData.location}`}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={forecastData.energy_forecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="date" fontSize={12} tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(value: number) => [`${value.toFixed(1)} kWh`, 'Energy Output']} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e0e0e0', borderRadius: '8px' }} />
                  <Bar dataKey="predicted_output_kwh" fill="#FF6B35" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Forecast ({forecastData.energy_forecast.length} days):</span>
                  <span className="font-bold text-[#002B5B]">{forecastData.energy_forecast.reduce((sum, day) => sum + day.predicted_output_kwh, 0).toFixed(1)} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Average:</span>
                  <span className="font-bold text-[#002B5B]">{ (forecastData.energy_forecast.reduce((sum, day) => sum + day.predicted_output_kwh, 0) / forecastData.energy_forecast.length).toFixed(1) } kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Peak Day:</span>
                  <span className="font-bold text-[#FF6B35]">{Math.max(...forecastData.energy_forecast.map(d => d.predicted_output_kwh)).toFixed(1)} kWh</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceForecastingPage;