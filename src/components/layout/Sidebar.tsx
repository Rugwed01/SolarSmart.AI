import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Satellite, 
  Search, 
  TrendingUp, 
  Target, 
  Upload,
  Menu,
  Sun
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/ai-twin', icon: Satellite, label: 'AI Twin Center' },
    { path: '/performance-analyzer', icon: Search, label: 'Performance Analyzer' },
    { path: '/forecasting', icon: TrendingUp, label: 'Forecasting' },
    { path: '/scenario-simulator', icon: Target, label: 'Scenario Simulator' },
    { path: '/data-upload', icon: Upload, label: 'Data Upload' },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white/80 backdrop-blur-md border-r border-gray-200/50 transition-all duration-300 z-50 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Logo and Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Sun className="w-8 h-8 text-[#FF6B35]" />
            <span className="text-xl font-bold text-[#002B5B]">SolarSmart</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100/50 transition-colors"
        >
          <Menu className="w-5 h-5 text-[#002B5B]" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-[#FF6B35]/10 text-[#FF6B35] border-r-2 border-[#FF6B35]'
                  : 'text-[#002B5B] hover:bg-gray-100/50'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="ml-3 font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;