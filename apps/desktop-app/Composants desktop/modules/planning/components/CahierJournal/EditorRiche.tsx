import React, { useState, useRef } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link, Image, Save, Eye, Type, Palette } from 'lucide-react';

interface EditorRicheProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

const EditorRiche: React.FC<EditorRicheProps> = ({
  value,
  onChange,
  placeholder = 'Commencez à écrire...',
  className = '',
  minHeight = '200px'
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const colors = [
    '#000000', '#333333', '#666666', '#999999',
    '#FF0000', '#FF6600', '#FFCC00', '#33CC00',
    '#0066CC', '#6600CC', '#CC0066', '#CC6600'
  ];

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertTemplate = (template: string) => {
    const templates = {
      'objectifs': `<h3>Objectifs pédagogiques</h3>
<p>À la fin de cette séance, l'élève sera capable de :</p>
<ul>
  <li>Objectif 1</li>
  <li>Objectif 2</li>
  <li>Objectif 3</li>
</ul>`,
      'deroulement': `<h3>Déroulement de la séance</h3>
<h4>1. Introduction (5 min)</h4>
<p>Description de l'introduction...</p>

<h4>2. Développement (30 min)</h4>
<p>Description du développement...</p>

<h4>3. Application (20 min)</h4>
<p>Description des exercices d'application...</p>

<h4>4. Évaluation (5 min)</h4>
<p>Description de l'évaluation...</p>`,
      'evaluation': `<h3>Modalités d'évaluation</h3>
<ul>
  <li><strong>Évaluation formative :</strong> Observation directe, questions orales</li>
  <li><strong>Évaluation sommative :</strong> Exercices écrits, contrôle des acquis</li>
  <li><strong>Critères de réussite :</strong> 80% des élèves maîtrisent les objectifs</li>
</ul>`
    };

    if (editorRef.current && templates[template as keyof typeof templates]) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const div = document.createElement('div');
        div.innerHTML = templates[template as keyof typeof templates];
        range.insertNode(div);
        onChange(editorRef.current.innerHTML);
      }
    }
  };

  const formatText = (format: string) => {
    switch (format) {
      case 'bold':
        execCommand('bold');
        break;
      case 'italic':
        execCommand('italic');
        break;
      case 'underline':
        execCommand('underline');
        break;
      case 'unorderedList':
        execCommand('insertUnorderedList');
        break;
      case 'orderedList':
        execCommand('insertOrderedList');
        break;
      case 'justifyLeft':
        execCommand('justifyLeft');
        break;
      case 'justifyCenter':
        execCommand('justifyCenter');
        break;
      case 'justifyRight':
        execCommand('justifyRight');
        break;
      case 'createLink':
        const url = prompt('Entrez l\'URL du lien:');
        if (url) execCommand('createLink', url);
        break;
    }
  };

  const applyColor = (color: string) => {
    execCommand('foreColor', color);
    setShowColorPicker(false);
  };

  const insertHeading = (level: number) => {
    execCommand('formatBlock', `h${level}`);
  };

  if (isPreview) {
    return (
      <div className={`border border-gray-300 rounded-lg ${className}`}>
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
          <h4 className="font-medium text-gray-900">Aperçu</h4>
          <button
            onClick={() => setIsPreview(false)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Modifier
          </button>
        </div>
        <div 
          className="p-4 prose max-w-none"
          style={{ minHeight }}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      </div>
    );
  }

  return (
    <div className={`border border-gray-300 rounded-lg ${className}`}>
      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-1 p-3 border-b border-gray-200 bg-gray-50">
        {/* Formatage de base */}
        <div className="flex items-center gap-1 pr-3 border-r border-gray-300">
          <button
            type="button"
            onClick={() => formatText('bold')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Gras"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            onClick={() => formatText('italic')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Italique"
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            onClick={() => formatText('underline')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Souligné"
          >
            <Underline size={16} />
          </button>
        </div>

        {/* Titres */}
        <div className="flex items-center gap-1 pr-3 border-r border-gray-300">
          <select
            onChange={(e) => {
              if (e.target.value) {
                insertHeading(parseInt(e.target.value));
                e.target.value = '';
              }
            }}
            className="px-2 py-1 text-sm border border-gray-300 rounded"
          >
            <option value="">Titre</option>
            <option value="1">Titre 1</option>
            <option value="2">Titre 2</option>
            <option value="3">Titre 3</option>
          </select>
        </div>

        {/* Couleurs */}
        <div className="relative pr-3 border-r border-gray-300">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Couleur du texte"
          >
            <Palette size={16} />
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              <div className="grid grid-cols-4 gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => applyColor(color)}
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Listes */}
        <div className="flex items-center gap-1 pr-3 border-r border-gray-300">
          <button
            type="button"
            onClick={() => formatText('unorderedList')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Liste à puces"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            onClick={() => formatText('orderedList')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Liste numérotée"
          >
            <ListOrdered size={16} />
          </button>
        </div>

        {/* Alignement */}
        <div className="flex items-center gap-1 pr-3 border-r border-gray-300">
          <button
            type="button"
            onClick={() => formatText('justifyLeft')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Aligner à gauche"
          >
            <AlignLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => formatText('justifyCenter')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Centrer"
          >
            <AlignCenter size={16} />
          </button>
          <button
            type="button"
            onClick={() => formatText('justifyRight')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Aligner à droite"
          >
            <AlignRight size={16} />
          </button>
        </div>

        {/* Liens et médias */}
        <div className="flex items-center gap-1 pr-3 border-r border-gray-300">
          <button
            type="button"
            onClick={() => formatText('createLink')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Insérer un lien"
          >
            <Link size={16} />
          </button>
        </div>

        {/* Modèles */}
        <div className="flex items-center gap-1 pr-3 border-r border-gray-300">
          <select
            onChange={(e) => {
              if (e.target.value) {
                insertTemplate(e.target.value);
                e.target.value = '';
              }
            }}
            className="px-2 py-1 text-sm border border-gray-300 rounded"
          >
            <option value="">Modèles</option>
            <option value="objectifs">Objectifs pédagogiques</option>
            <option value="deroulement">Déroulement de séance</option>
            <option value="evaluation">Modalités d'évaluation</option>
          </select>
        </div>

        {/* Aperçu */}
        <button
          type="button"
          onClick={() => setIsPreview(true)}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Aperçu"
        >
          <Eye size={16} />
        </button>
      </div>

      {/* Zone d'édition */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="p-4 focus:outline-none prose max-w-none"
        style={{ minHeight }}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
        
        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
          margin-top: 1em;
          margin-bottom: 0.5em;
          font-weight: 600;
        }
        
        .prose h1 { font-size: 1.5em; }
        .prose h2 { font-size: 1.3em; }
        .prose h3 { font-size: 1.1em; }
        
        .prose ul, .prose ol {
          margin: 0.5em 0;
          padding-left: 1.5em;
        }
        
        .prose li {
          margin: 0.25em 0;
        }
        
        .prose p {
          margin: 0.5em 0;
          line-height: 1.6;
        }
        
        .prose a {
          color: #2563EB;
          text-decoration: underline;
        }
        
        .prose strong {
          font-weight: 600;
        }
        
        .prose em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default EditorRiche;