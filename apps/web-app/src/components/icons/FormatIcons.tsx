import React from 'react';

interface IconProps {
  className?: string;
}

export const PDFIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="3" width="20" height="18" rx="2" fill="#DC2626" />
    <path
      d="M7 8h2v2H7V8zm0 3h2v2H7v-2zm0 3h2v2H7v-2z"
      fill="white"
    />
    <path
      d="M12 8h4v2h-4V8zm0 3h4v2h-4v-2zm0 3h4v2h-4v-2z"
      fill="white"
    />
    <path
      d="M7 6h10v2H7V6z"
      fill="white"
    />
    <text
      x="12"
      y="5"
      textAnchor="middle"
      fontSize="8"
      fill="white"
      fontWeight="bold"
    >
      PDF
    </text>
  </svg>
);

export const ExcelIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="3" width="20" height="18" rx="2" fill="#059669" />
    <path
      d="M7 8h2v2H7V8zm0 3h2v2H7v-2zm0 3h2v2H7v-2z"
      fill="white"
    />
    <path
      d="M12 8h4v2h-4V8zm0 3h4v2h-4v-2zm0 3h4v2h-4v-2z"
      fill="white"
    />
    <path
      d="M7 6h10v2H7V6z"
      fill="white"
    />
    <text
      x="12"
      y="5"
      textAnchor="middle"
      fontSize="8"
      fill="white"
      fontWeight="bold"
    >
      XLS
    </text>
  </svg>
);

export const CSVIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="3" width="20" height="18" rx="2" fill="#7C3AED" />
    <path
      d="M7 8h2v2H7V8zm0 3h2v2H7v-2zm0 3h2v2H7v-2z"
      fill="white"
    />
    <path
      d="M12 8h4v2h-4V8zm0 3h4v2h-4v-2zm0 3h4v2h-4v-2z"
      fill="white"
    />
    <path
      d="M7 6h10v2H7V6z"
      fill="white"
    />
    <text
      x="12"
      y="5"
      textAnchor="middle"
      fontSize="8"
      fill="white"
      fontWeight="bold"
    >
      CSV
    </text>
  </svg>
);

// Icônes alternatives plus détaillées
export const PDFIconDetailed: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="2" width="18" height="20" rx="2" fill="#DC2626" />
    <rect x="5" y="6" width="14" height="1" fill="white" />
    <rect x="5" y="8" width="14" height="1" fill="white" />
    <rect x="5" y="10" width="14" height="1" fill="white" />
    <rect x="5" y="12" width="14" height="1" fill="white" />
    <rect x="5" y="14" width="14" height="1" fill="white" />
    <rect x="5" y="16" width="14" height="1" fill="white" />
    <rect x="5" y="18" width="14" height="1" fill="white" />
    <text
      x="12"
      y="4.5"
      textAnchor="middle"
      fontSize="6"
      fill="white"
      fontWeight="bold"
    >
      PDF
    </text>
    <circle cx="8" cy="4" r="1" fill="white" />
  </svg>
);

export const ExcelIconDetailed: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="2" width="18" height="20" rx="2" fill="#059669" />
    <rect x="5" y="6" width="14" height="1" fill="white" />
    <rect x="5" y="8" width="14" height="1" fill="white" />
    <rect x="5" y="10" width="14" height="1" fill="white" />
    <rect x="5" y="12" width="14" height="1" fill="white" />
    <rect x="5" y="14" width="14" height="1" fill="white" />
    <rect x="5" y="16" width="14" height="1" fill="white" />
    <rect x="5" y="18" width="14" height="1" fill="white" />
    <text
      x="12"
      y="4.5"
      textAnchor="middle"
      fontSize="6"
      fill="white"
      fontWeight="bold"
    >
      XLS
    </text>
    <rect x="8" y="3" width="8" height="1" fill="white" />
  </svg>
);

export const CSVIconDetailed: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="2" width="18" height="20" rx="2" fill="#7C3AED" />
    <rect x="5" y="6" width="14" height="1" fill="white" />
    <rect x="5" y="8" width="14" height="1" fill="white" />
    <rect x="5" y="10" width="14" height="1" fill="white" />
    <rect x="5" y="12" width="14" height="1" fill="white" />
    <rect x="5" y="14" width="14" height="1" fill="white" />
    <rect x="5" y="16" width="14" height="1" fill="white" />
    <rect x="5" y="18" width="14" height="1" fill="white" />
    <text
      x="12"
      y="4.5"
      textAnchor="middle"
      fontSize="6"
      fill="white"
      fontWeight="bold"
    >
      CSV
    </text>
    <rect x="8" y="3" width="8" height="1" fill="white" />
    <circle cx="9" cy="4" r="0.5" fill="white" />
  </svg>
);
