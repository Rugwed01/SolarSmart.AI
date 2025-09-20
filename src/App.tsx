import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CityProvider } from './context/CityContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import AITwinCenter from './pages/AITwinCenter';
import PerformanceAnalyzer from './pages/PerformanceAnalyzer';
import PerformanceForecasting from './pages/PerformanceForecasting';
import ScenarioSimulator from './pages/ScenarioSimulator';
import DataUpload from './pages/DataUpload';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <CityProvider>
      <Router>
        <div className="min-h-screen bg-[#F8F9FA] flex">
          <Sidebar 
            collapsed={sidebarCollapsed} 
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
          />

          <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
            <Header />

            <main className="p-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/ai-twin" element={<AITwinCenter />} />
                <Route path="/performance-analyzer" element={<PerformanceAnalyzer />} />
                <Route path="/forecasting" element={<PerformanceForecasting />} />
                <Route path="/scenario-simulator" element={<ScenarioSimulator />} />
                <Route path="/data-upload" element={<DataUpload />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </CityProvider>
  );  
}

export default App;