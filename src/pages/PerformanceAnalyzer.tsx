import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';

const PerformanceAnalyzer: React.FC = () => {
  const [sortField, setSortField] = useState<string>('panelId');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const panelData = [
    { panelId: 'Panel_001', status: 'Critical', anomalyRate: 15.2, avgOutput: 2.1, voltageStability: 'Poor' },
    { panelId: 'Panel_002', status: 'Good', anomalyRate: 2.1, avgOutput: 5.8, voltageStability: 'Excellent' },
    { panelId: 'Panel_003', status: 'Fair', anomalyRate: 8.5, avgOutput: 4.2, voltageStability: 'Good' },
    { panelId: 'Panel_004', status: 'Poor', anomalyRate: 12.8, avgOutput: 3.1, voltageStability: 'Fair' },
    { panelId: 'Panel_005', status: 'Good', anomalyRate: 1.8, avgOutput: 5.9, voltageStability: 'Excellent' },
    { panelId: 'Panel_006', status: 'Critical', anomalyRate: 18.3, avgOutput: 1.9, voltageStability: 'Poor' },
    { panelId: 'Panel_007', status: 'Good', anomalyRate: 2.5, avgOutput: 5.7, voltageStability: 'Good' },
    { panelId: 'Panel_008', status: 'Fair', anomalyRate: 6.7, avgOutput: 4.8, voltageStability: 'Fair' },
  ];

  const healthDistribution = [
    { name: 'Good', value: 37.5, count: 3, color: '#28a745' },
    { name: 'Fair', value: 25, count: 2, color: '#ffc107' },
    { name: 'Poor', value: 12.5, count: 1, color: '#fd7e14' },
    { name: 'Critical', value: 25, count: 2, color: '#dc3545' },
  ];

  const recommendations = {
    critical: ['Panel_001', 'Panel_006'],
    warning: ['Panel_004'],
    caution: ['Panel_003', 'Panel_008']
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Critical': return <XCircle className="w-4 h-4 text-[#dc3545]" />;
      case 'Poor': return <AlertTriangle className="w-4 h-4 text-[#fd7e14]" />;
      case 'Fair': return <Clock className="w-4 h-4 text-[#ffc107]" />;
      case 'Good': return <CheckCircle className="w-4 h-4 text-[#28a745]" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Critical': return 'bg-[#dc3545]/10 text-[#dc3545] border-[#dc3545]/20';
      case 'Poor': return 'bg-[#fd7e14]/10 text-[#fd7e14] border-[#fd7e14]/20';
      case 'Fair': return 'bg-[#ffc107]/10 text-[#ffc107] border-[#ffc107]/20';
      case 'Good': return 'bg-[#28a745]/10 text-[#28a745] border-[#28a745]/20';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getRowHighlight = (status: string) => {
    return status === 'Critical' ? 'bg-red-50/50' : '';
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = [...panelData].sort((a, b) => {
    const aVal = a[sortField as keyof typeof a];
    const bVal = b[sortField as keyof typeof b];
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Data Table */}
        <div className="xl:col-span-3">
          <GlassCard title="Panel Health Status">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('panelId')}
                    >
                      Panel ID {sortField === 'panelId' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('status')}
                    >
                      Health Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="text-right py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('anomalyRate')}
                    >
                      Anomaly Rate (%) {sortField === 'anomalyRate' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="text-right py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('avgOutput')}
                    >
                      Avg. Output (kWh) {sortField === 'avgOutput' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('voltageStability')}
                    >
                      Voltage Stability {sortField === 'voltageStability' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((panel, index) => (
                    <tr key={panel.panelId} className={`border-b border-gray-100 hover:bg-gray-50/50 ${getRowHighlight(panel.status)}`}>
                      <td className="py-3 px-4 font-medium text-[#002B5B]">{panel.panelId}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(panel.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(panel.status)}`}>
                            {panel.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono">{panel.anomalyRate}%</td>
                      <td className="py-3 px-4 text-right font-mono">{panel.avgOutput}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          panel.voltageStability === 'Excellent' ? 'bg-green-100 text-green-800' :
                          panel.voltageStability === 'Good' ? 'bg-blue-100 text-blue-800' :
                          panel.voltageStability === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {panel.voltageStability}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button className="px-3 py-1 bg-[#FF6B35] text-white rounded-md text-sm hover:bg-[#FF6B35]/80 transition-colors">
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Health Distribution Chart */}
          <GlassCard title="Panel Health Distribution">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={healthDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={70}
                    dataKey="value"
                  >
                    {healthDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value}% (${healthDistribution.find(h => h.name === name)?.count} panels)`, name]}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {healthDistribution.map((item) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs text-gray-600">{item.name} ({item.count})</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Maintenance Recommendations */}
          <GlassCard title="Maintenance Recommendations">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-[#dc3545] mb-2 flex items-center">
                  <XCircle className="w-4 h-4 mr-1" />
                  Urgent - Critical Issues
                </h4>
                <div className="space-y-1">
                  {recommendations.critical.map((panelId) => (
                    <div key={panelId} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                      {panelId}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-[#fd7e14] mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Warning - Poor Performance
                </h4>
                <div className="space-y-1">
                  {recommendations.warning.map((panelId) => (
                    <div key={panelId} className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded">
                      {panelId}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-[#ffc107] mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Caution - Fair Performance
                </h4>
                <div className="space-y-1">
                  {recommendations.caution.map((panelId) => (
                    <div key={panelId} className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
                      {panelId}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalyzer;