
import React from 'react';
import { Store } from 'lucide-react'; // Example icon

interface AppLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

const AppLogo: React.FC<AppLogoProps> = ({ width = 40, height = 40, className }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Store className="text-white" style={{ width, height }} aria-hidden="true" />
       <span className="font-headline text-2xl font-bold text-white hidden md:inline">Wizzzey</span>
    </div>
  );
};

export default AppLogo;
