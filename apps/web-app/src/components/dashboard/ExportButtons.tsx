import React from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';

interface ExportButtonsProps {
  onExportPDF: () => void;
  onExportExcel: () => void;
  disabled?: boolean;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({
  onExportPDF,
  onExportExcel,
  disabled = false
}) => {
  return (
    <div className="flex space-x-2">
      <button
        onClick={onExportPDF}
        disabled={disabled}
        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        <FileText className="w-4 h-4 mr-2" />
        Export PDF
      </button>
      <button
        onClick={onExportExcel}
        disabled={disabled}
        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        <FileSpreadsheet className="w-4 h-4 mr-2" />
        Export Excel
      </button>
    </div>
  );
};

export default ExportButtons;
