// File: src/pages/ScenarioSimulator.tsx

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Zap } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';

// Define the "blueprint" for our configuration and result objects
interface SimConfig {
  num_panels: number;
  panel_wattage: number;
  tilt_angle: number;
  latitude: number;
  azimuth: number;
  shading_factor: number;
  cleaning_frequency: string;
  degradation_rate: number;
}

interface SimResult {
  name: string;
  annual_output_kwh: number;
}

const ScenarioSimulator: React.FC = () => {
  // State for the user's inputs
  const [config, setConfig] = useState<SimConfig>({
    num_panels: 50,
    panel_wattage: 400,
    tilt_angle: 21, // Optimal for Nagpur
    latitude: 21.1,
    azimuth: 180,
    shading_factor: 5,
    cleaning_frequency: 'Monthly',
    degradation_rate: 0.5,
  });

  // State for the dynamic electricity rate 
  const [electricityRate, setElectricityRate] = useState(8.0); // ₹ per kWh
  
  // State to hold results from the API
  const [results, setResults] = useState<SimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfigChange = (field: keyof SimConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  // Helper function to call the backend API for a single scenario
  const runSimulation = async (scenarioConfig: SimConfig): Promise<number> => {
    const response = await fetch('http://127.0.0.1:8000/api/simulate-scenario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenarioConfig),
    });
    if (!response.ok) throw new Error('Simulation API call failed');
    const data = await response.json();
    return data.annual_output_kwh;
  };

  // Main function to run all simulations when the user clicks the button
  const handleCalculate = async () => {
    setIsLoading(true);
    setError('');
    setResults([]);

    try {
      // Define "What-If" scenarios based on the user's current configuration
      const scenariosToRun = {
        "Base Case": config,
        "+20 Panels": { ...config, num_panels: config.num_panels + 20 },
        "Optimal Tilt": { ...config, tilt_angle: Math.round(config.latitude) },
        "Quarterly Cleaning": { ...config, cleaning_frequency: 'Quarterly' },
      };

      // Run all simulations in parallel for speed
      const promises = Object.entries(scenariosToRun).map(([name, scenarioConfig]) => 
        runSimulation(scenarioConfig).then(output => ({ name, annual_output_kwh: output }))
      );
      
      const scenarioResults = await Promise.all(promises);
      setResults(scenarioResults);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Find the 'Base Case' result to compare against
  const baseCaseOutput = results.find(r => r.name === 'Base Case')?.annual_output_kwh ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* --- Input Controls Column --- */}
        <div className="space-y-6">
          <GlassCard title="1. Panel Configuration">
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-[#002B5B] mb-2">Number of Panels: {config.num_panels}</label><input type="range" min="10" max="200" value={config.num_panels} onChange={(e) => handleConfigChange('num_panels', parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" /><div className="flex justify-between text-xs text-gray-500 mt-1"><span>10</span><span>200</span></div></div>
              <div><label className="block text-sm font-medium text-[#002B5B] mb-2">Panel Wattage: {config.panel_wattage}W</label><input type="range" min="200" max="600" step="50" value={config.panel_wattage} onChange={(e) => handleConfigChange('panel_wattage', parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" /><div className="flex justify-between text-xs text-gray-500 mt-1"><span>200W</span><span>600W</span></div></div>
              <div><label className="block text-sm font-medium text-[#002B5B] mb-2">Tilt Angle: {config.tilt_angle}°</label><input type="range" min="0" max="60" value={config.tilt_angle} onChange={(e) => handleConfigChange('tilt_angle', parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" /><div className="flex justify-between text-xs text-gray-500 mt-1"><span>0°</span><span>60°</span></div></div>
            </div>
          </GlassCard>

          <GlassCard title="2. Location & Maintenance">
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-[#002B5B] mb-2">Latitude: {config.latitude.toFixed(1)}°</label><input type="range" min="-90" max="90" step="0.1" value={config.latitude} onChange={(e) => handleConfigChange('latitude', parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" /><div className="flex justify-between text-xs text-gray-500 mt-1"><span>-90°</span><span>90°</span></div></div>
              <div><label className="block text-sm font-medium text-[#002B5B] mb-2">Azimuth: {config.azimuth}°</label><input type="range" min="0" max="360" value={config.azimuth} onChange={(e) => handleConfigChange('azimuth', parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" /><div className="flex justify-between text-xs text-gray-500 mt-1"><span>0° (N)</span><span>180° (S)</span><span>360° (N)</span></div></div>
              <div><label className="block text-sm font-medium text-[#002B5B] mb-2">Cleaning Frequency</label><select value={config.cleaning_frequency} onChange={(e) => handleConfigChange('cleaning_frequency', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"><option value="Weekly">Weekly</option><option value="Monthly">Monthly</option><option value="Quarterly">Quarterly</option><option value="Annually">Annually</option></select></div>
              <div><label className="block text-sm font-medium text-[#002B5B] mb-2">Annual Degradation: {config.degradation_rate.toFixed(1)}%</label><input type="range" min="0" max="2" step="0.1" value={config.degradation_rate} onChange={(e) => handleConfigChange('degradation_rate', parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" /><div className="flex justify-between text-xs text-gray-500 mt-1"><span>0%</span><span>2%</span></div></div>
            </div>
          </GlassCard>

          <GlassCard title="3. Financials">
            <div>
              <label className="block text-sm font-medium text-[#002B5B] mb-2">Electricity Rate (₹/kWh): ₹{electricityRate.toFixed(2)}</label>
              <input type="range" min="1" max="15" step="0.25" value={electricityRate} onChange={(e) => setElectricityRate(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
            </div>
          </GlassCard>
          
          <div>
            <button
              onClick={handleCalculate}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-6 py-4 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF6B35]/80 transition-colors font-medium text-lg disabled:bg-gray-400"
            >
              <Zap className="w-5 h-5 mr-2" />
              {isLoading ? 'Calculating...' : 'Run Simulation'}
            </button>
          </div>
        </div>

        {/* --- Results Column --- */}
        <div className="space-y-6">
          {isLoading && <div className="text-center font-medium p-8">Running simulations...</div>}
          {error && <GlassCard><p className="text-red-500 text-center p-8">{error}</p></GlassCard>}
          
          {results.length > 0 && (
            <>
              <GlassCard title="Scenario Comparison">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-2 font-semibold text-gray-700">Scenario</th>
                        <th className="text-right py-2 font-semibold text-gray-700">Annual Output</th>
                        <th className="text-right py-2 font-semibold text-gray-700">Annual Savings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((res, index) => {
                        const gainKwh = res.annual_output_kwh - baseCaseOutput;
                        const savings = res.annual_output_kwh * electricityRate;
                        const gainSavings = savings - (baseCaseOutput * electricityRate);

                        return (
                          <tr key={index} className={`border-b border-gray-100 ${res.name === 'Base Case' ? 'bg-blue-50' : ''}`}>
                            <td className="py-3 font-medium text-[#002B5B]">{res.name}</td>
                            <td className="text-right py-3 font-mono">
                              {res.annual_output_kwh.toLocaleString('en-IN', { maximumFractionDigits: 0 })} kWh
                              {res.name !== 'Base Case' && (
                                <span className={`block text-xs ${gainKwh >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {gainKwh >= 0 ? '+' : ''}{gainKwh.toLocaleString('en-IN', { maximumFractionDigits: 0 })} kWh
                                </span>
                              )}
                            </td>
                            <td className="text-right py-3 font-mono">
                              ₹{savings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                              {res.name !== 'Base Case' && (
                                <span className={`block text-xs ${gainSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {gainSavings >= 0 ? '+' : ''}₹{gainSavings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
              
              <GlassCard title="Visual Comparison (Annual Output)">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={results} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(tick) => `${tick/1000}k`} />
                    <YAxis dataKey="name" type="category" width={110} />
                    <Tooltip formatter={(value: number) => [`${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })} kWh`, 'Annual Output']} />
                    <Legend />
                    <Bar dataKey="annual_output_kwh" fill="#FF6B35" name="Annual Output" />
                  </BarChart>
                </ResponsiveContainer>
              </GlassCard>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioSimulator;