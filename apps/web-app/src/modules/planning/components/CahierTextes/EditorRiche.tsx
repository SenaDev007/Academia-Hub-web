import React, { useState } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface EditorRicheProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const EditorRiche: React.FC<EditorRicheProps> = ({ value, onChange, placeholder }) => {
  const [selectedText, setSelectedText] = useState('');

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerHTML;
    onChange(content);
  };

  const handleSelectionChange = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      setSelectedText(selection.toString());
    }
  };

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
      {/* Barre d'outils */}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex items-center space-x-1">
        <button
          type="button"
          onClick={() => applyFormat('bold')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
          title="Gras"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('italic')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
          title="Italique"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('underline')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
          title="Souligné"
        >
          <Underline className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-2"></div>
        
        <button
          type="button"
          onClick={() => applyFormat('insertUnorderedList')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
          title="Liste à puces"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('insertOrderedList')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
          title="Liste numérotée"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-2"></div>
        
        <button
          type="button"
          onClick={() => applyFormat('justifyLeft')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
          title="Aligner à gauche"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('justifyCenter')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
          title="Centrer"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('justifyRight')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
          title="Aligner à droite"
        >
          <AlignRight className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-2"></div>
        
        <select
          onChange={(e) => applyFormat('formatBlock', e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
          defaultValue=""
        >
          <option value="">Format</option>
          <option value="h3">Titre 3</option>
          <option value="h4">Titre 4</option>
          <option value="p">Paragraphe</option>
        </select>
      </div>

      {/* Éditeur */}
      <div
        contentEditable
        onInput={handleInput}
        onMouseUp={handleSelectionChange}
        onKeyUp={handleSelectionChange}
        dangerouslySetInnerHTML={{ __html: value }}
        className="min-h-32 p-3 focus:outline-none"
        style={{
          maxHeight: '300px',
          overflowY: 'auto'
        }}
        data-placeholder={placeholder}
      />
      
      {!value && placeholder && (
        <div className="absolute top-12 left-3 text-gray-400 pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default EditorRiche;