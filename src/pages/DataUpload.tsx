import React, { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Upload, FileText, BarChart3 } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';

const DataUpload: React.FC = () => {
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedXAxis, setSelectedXAxis] = useState<string>('');
  const [selectedYAxis, setSelectedYAxis] = useState<string>('');
  const [showVisualization, setShowVisualization] = useState(false);

  // Simulated uploaded data
  const sampleData = [
    { timestamp: '2025-01-01', voltage: 240.2, current: 3.8, power: 912, temperature: 28.5, efficiency: 18.2 },
    { timestamp: '2025-01-02', voltage: 239.8, current: 3.9, power: 935, temperature: 29.1, efficiency: 18.7 },
    { timestamp: '2025-01-03', voltage: 241.1, current: 3.7, power: 892, temperature: 27.8, efficiency: 17.9 },
    { timestamp: '2025-01-04', voltage: 240.5, current: 3.8, power: 914, temperature: 28.9, efficiency: 18.3 },
    { timestamp: '2025-01-05', voltage: 238.9, current: 4.0, power: 956, temperature: 30.2, efficiency: 19.1 },
    { timestamp: '2025-01-06', voltage: 242.0, current: 3.6, power: 871, temperature: 27.2, efficiency: 17.4 },
    { timestamp: '2025-01-07', voltage: 240.8, current: 3.9, power: 939, temperature: 29.5, efficiency: 18.8 },
    { timestamp: '2025-01-08', voltage: 239.5, current: 3.8, power: 910, temperature: 28.7, efficiency: 18.2 },
    { timestamp: '2025-01-09', voltage: 241.3, current: 3.7, power: 893, temperature: 28.1, efficiency: 17.9 },
    { timestamp: '2025-01-10', voltage: 240.1, current: 3.9, power: 936, temperature: 29.8, efficiency: 18.7 },
  ];

  const handleFileUpload = () => {
    // Simulate file upload
    setUploadedData(sampleData);
    setColumns(Object.keys(sampleData[0]));
    setSelectedXAxis('temperature');
    setSelectedYAxis('efficiency');
  };

  const generateVisualization = () => {
    setShowVisualization(true);
  };

  const getStatistics = (data: any[], column: string) => {
    const values = data.map(row => parseFloat(row[column])).filter(val => !isNaN(val));
    if (values.length === 0) return null;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const sortedValues = values.sort((a, b) => a - b);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);
    
    return {
      mean: mean.toFixed(2),
      std: std.toFixed(2),
      min: Math.min(...values).toFixed(2),
      max: Math.max(...values).toFixed(2)
    };
  };

  const numericalColumns = columns.filter(col => 
    uploadedData.length > 0 && !isNaN(parseFloat(uploadedData[0][col]))
  );

  const chartData = uploadedData.map(row => ({
    x: parseFloat(row[selectedXAxis]),
    y: parseFloat(row[selectedYAxis])
  })).filter(point => !isNaN(point.x) && !isNaN(point.y));

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <GlassCard title="Data Upload">
        <div className="text-center">
          {uploadedData.length === 0 ? (
            <div className="py-12">
              <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-[#002B5B] mb-2">Upload CSV File</h3>
              <p className="text-gray-600 mb-6">Drag and drop your CSV file here, or click to select</p>
              <button
                onClick={handleFileUpload}
                className="px-6 py-3 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF6B35]/80 transition-colors font-medium"
              >
                Select File (Demo)
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center py-4 text-[#28a745]">
              <FileText className="w-6 h-6 mr-2" />
              <span className="font-medium">sample_solar_data.csv uploaded successfully</span>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Data Preview */}
      {uploadedData.length > 0 && (
        <>
          <GlassCard title="Data Preview (First 10 rows)">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    {columns.map(col => (
                      <th key={col} className="text-left py-2 px-3 font-medium text-gray-600">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {uploadedData.slice(0, 10).map((row, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      {columns.map(col => (
                        <td key={col} className="py-2 px-3 font-mono text-xs">
                          {row[col]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Data Summary */}
          <GlassCard title="Data Summary">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {numericalColumns.map(column => {
                const stats = getStatistics(uploadedData, column);
                if (!stats) return null;

                return (
                  <div key={column} className="bg-gray-50/50 p-4 rounded-lg">
                    <h4 className="font-medium text-[#002B5B] mb-3 capitalize">{column}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mean:</span>
                        <span className="font-mono">{stats.mean}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Std Dev:</span>
                        <span className="font-mono">{stats.std}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Min:</span>
                        <span className="font-mono">{stats.min}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max:</span>
                        <span className="font-mono">{stats.max}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Visualization Creator */}
          <GlassCard title="Create Visualization">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#002B5B] mb-2">
                  Select X-axis
                </label>
                <select
                  value={selectedXAxis}
                  onChange={(e) => setSelectedXAxis(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                >
                  <option value="">Choose column...</option>
                  {numericalColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#002B5B] mb-2">
                  Select Y-axis
                </label>
                <select
                  value={selectedYAxis}
                  onChange={(e) => setSelectedYAxis(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                >
                  <option value="">Choose column...</option>
                  {numericalColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={generateVisualization}
                  disabled={!selectedXAxis || !selectedYAxis}
                  className="w-full px-4 py-2 bg-[#FF6B35] text-white rounded-md hover:bg-[#FF6B35]/80 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generate
                </button>
              </div>
            </div>

            {/* Scatter Plot */}
            {showVisualization && selectedXAxis && selectedYAxis && (
              <div className="mt-6">
                <h4 className="text-lg font-medium text-[#002B5B] mb-4">
                  {selectedYAxis} vs {selectedXAxis}
                </h4>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name={selectedXAxis}
                      stroke="#666"
                      fontSize={12}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name={selectedYAxis}
                      stroke="#666"
                      fontSize={12}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value, name) => [
                        parseFloat(value as string).toFixed(2), 
                        name === 'x' ? selectedXAxis : selectedYAxis
                      ]}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        backdropFilter: 'blur(10px)'
                      }}
                    />
                    <Scatter 
                      data={chartData} 
                      fill="#FF6B35"
                      stroke="#FF6B35"
                      strokeWidth={1}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}
          </GlassCard>
        </>
      )}
    </div>
  );
};

export default DataUpload;