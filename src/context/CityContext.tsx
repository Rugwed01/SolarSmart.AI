// File: src/context/CityContext.tsx

import { createContext, useState, useContext, ReactNode } from 'react';

// Define the "shape" of our shared context data
interface CityContextType {
  activeCity: string;
  setActiveCity: (city: string) => void;
}

// Create the context with a default value
const CityContext = createContext<CityContextType | undefined>(undefined);

// Create a "Provider" component that will wrap our entire app
export const CityProvider = ({ children }: { children: ReactNode }) => {
  const [activeCity, setActiveCity] = useState('Nagpur'); // Default city

  const value = { activeCity, setActiveCity };

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
};

// Create a custom hook to easily use the context in any component
export const useCity = () => {
  const context = useContext(CityContext);
  if (context === undefined) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};