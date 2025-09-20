import React from 'react';
import { User, Bell } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#002B5B]">Solar Asset Management</h1>
          <p className="text-gray-600">Real-time monitoring and analytics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-lg hover:bg-gray-100/50 transition-colors relative">
            <Bell className="w-5 h-5 text-[#002B5B]" />
            <span className="absolute -top-1 -right-1 bg-[#FF6B35] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#FF6B35] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-[#002B5B] font-medium">Admin User</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;