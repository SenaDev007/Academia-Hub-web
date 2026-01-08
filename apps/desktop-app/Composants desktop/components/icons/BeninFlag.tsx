import React from 'react';

interface BeninFlagProps {
  width?: number;
  height?: number;
  className?: string;
}

const BeninFlag: React.FC<BeninFlagProps> = ({ 
  width = 64, 
  height = 80, 
  className = '' 
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 64 80"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bande verte verticale (1/3 de la largeur) */}
      <rect x="0" y="0" width="21.33" height="80" fill="#008751" />
      
      {/* Bande jaune horizontale (2/3 de la largeur, 1/2 de la hauteur) */}
      <rect x="21.33" y="0" width="42.67" height="40" fill="#FCD116" />
      
      {/* Bande rouge horizontale (2/3 de la largeur, 1/2 de la hauteur) */}
      <rect x="21.33" y="40" width="42.67" height="40" fill="#E8112D" />
      
      {/* Texte BÉNIN */}
      <text
        x="32"
        y="45"
        textAnchor="middle"
        className="fill-white text-[8px] font-bold"
        style={{ fontSize: '8px', fontWeight: 'bold' }}
      >
        BÉNIN
      </text>
    </svg>
  );
};

export default BeninFlag;
