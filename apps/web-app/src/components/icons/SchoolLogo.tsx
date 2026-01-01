import React from 'react';

interface SchoolLogoProps {
  width?: number;
  height?: number;
  className?: string;
  schoolName?: string;
}

const SchoolLogo: React.FC<SchoolLogoProps> = ({ 
  width = 64, 
  height = 80, 
  className = '',
  schoolName = 'ÉCOLE'
}) => {
  return (
    <div 
      className={`bg-gradient-to-br from-blue-50 to-blue-100 border border-gray-300 rounded-lg flex flex-col items-center justify-center ${className}`}
      style={{ width, height }}
    >
      {/* Icône d'école */}
      <div className="text-blue-600 text-2xl mb-1">
        🏫
      </div>
      
      {/* Nom de l'école */}
      <div className="text-blue-800 text-[8px] font-bold text-center leading-tight px-1">
        {schoolName.split(' ').map(word => word.substring(0, 4)).join(' ')}
      </div>
      
      {/* Sous-titre */}
      <div className="text-blue-600 text-[6px] text-center mt-1">
        LOGO
      </div>
    </div>
  );
};

export default SchoolLogo;
