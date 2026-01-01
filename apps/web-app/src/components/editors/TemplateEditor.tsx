import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  List,
  ListOrdered,
  Table,
  Image,
  Type,
  Save,
  Eye,
  Undo,
  Redo,
  Palette,
  Link,
  Code,
  FileText,
  Trash2,
  Plus,
  Minus
} from 'lucide-react';

interface TemplateEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  onPreview?: () => void;
  isEditMode?: boolean;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  content,
  onChange,
  onSave,
  onPreview,
  isEditMode = false
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [fontSize, setFontSize] = useState('14');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

  // Variables disponibles pour les templates
  const availableVariables = [
    { name: 'nomEleve', label: 'Nom de l\'élève', example: 'Dupont' },
    { name: 'prenomEleve', label: 'Prénom de l\'élève', example: 'Jean' },
    { name: 'classe', label: 'Classe', example: '6ème A' },
    { name: 'numeroInscription', label: 'N° d\'inscription', example: '2024-001' },
    { name: 'nomEcole', label: 'Nom de l\'école', example: 'École Exemple' },
    { name: 'adresseEcole', label: 'Adresse de l\'école', example: '123 Rue de l\'École' },
    { name: 'telephoneEcole', label: 'Téléphone de l\'école', example: '+229 12 34 56 78' },
    { name: 'emailEcole', label: 'Email de l\'école', example: 'contact@ecole.com' },
    { name: 'directeurNom', label: 'Nom du directeur', example: 'M. Martin' },
    { name: 'directeurTitre', label: 'Titre du directeur', example: 'Directeur' },
    { name: 'dateEmission', label: 'Date d\'émission', example: '15/01/2024' },
    { name: 'ville', label: 'Ville', example: 'Cotonou' },
    { name: 'anneeScolaire', label: 'Année scolaire', example: '2023-2024' },
    { name: 'trimestre', label: 'Trimestre', example: '1er' },
    { name: 'moyenneGenerale', label: 'Moyenne générale', example: '15.5' },
    { name: 'rang', label: 'Rang', example: '5' },
    { name: 'effectif', label: 'Effectif', example: '30' },
    { name: 'mention', label: 'Mention', example: 'Bien' }
  ];

  // Initialiser l'éditeur
  useEffect(() => {
    if (editorRef.current && !isPreviewMode) {
      editorRef.current.innerHTML = content || '<p>Commencez à taper votre template...</p>';
    }
  }, [content, isPreviewMode]);

  // Fonctions de formatage
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertVariable = (variable: string) => {
    const variableTag = `{{${variable}}}`;
    execCommand('insertText', variableTag);
  };

  const insertTable = () => {
    const tableHTML = `
      <table style="border-collapse: collapse; width: 100%; margin: 10px 0;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Colonne 1</th>
            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Colonne 2</th>
            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Colonne 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 8px;">Contenu 1</td>
            <td style="border: 1px solid #d1d5db; padding: 8px;">Contenu 2</td>
            <td style="border: 1px solid #d1d5db; padding: 8px;">Contenu 3</td>
          </tr>
        </tbody>
      </table>
    `;
    execCommand('insertHTML', tableHTML);
  };

  const insertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgHTML = `<img src="${e.target?.result}" style="max-width: 100%; height: auto; margin: 10px 0;" alt="Image" />`;
          execCommand('insertHTML', imgHTML);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const togglePreview = () => {
    if (editorRef.current) {
      if (!isPreviewMode) {
        // Passer en mode aperçu
        onChange(editorRef.current.innerHTML);
      }
      setIsPreviewMode(!isPreviewMode);
    }
  };

  const handleContentChange = () => {
    if (editorRef.current && !isPreviewMode) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="template-editor">
      {/* Barre d'outils */}
      <div className="bg-gray-50 border border-gray-200 rounded-t-lg p-4">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Formatage de texte */}
          <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
            <button
              onClick={() => execCommand('bold')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Gras"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('italic')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Italique"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('underline')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Souligné"
            >
              <Underline className="w-4 h-4" />
            </button>
          </div>

          {/* Alignement */}
          <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
            <button
              onClick={() => execCommand('justifyLeft')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Aligner à gauche"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('justifyCenter')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Centrer"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('justifyRight')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Aligner à droite"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('justifyFull')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Justifier"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>

          {/* Listes */}
          <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
            <button
              onClick={() => execCommand('insertUnorderedList')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Liste à puces"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('insertOrderedList')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Liste numérotée"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          {/* Éléments */}
          <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
            <button
              onClick={insertTable}
              className="p-2 hover:bg-gray-200 rounded"
              title="Insérer un tableau"
            >
              <Table className="w-4 h-4" />
            </button>
            <button
              onClick={insertImage}
              className="p-2 hover:bg-gray-200 rounded"
              title="Insérer une image"
            >
              <Image className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('createLink')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Insérer un lien"
            >
              <Link className="w-4 h-4" />
            </button>
          </div>

          {/* Couleurs et police */}
          <div className="flex items-center space-x-2 border-r border-gray-300 pr-2">
            <div className="flex items-center space-x-1">
              <Type className="w-4 h-4" />
              <input
                type="color"
                value={textColor}
                onChange={(e) => {
                  setTextColor(e.target.value);
                  execCommand('foreColor', e.target.value);
                }}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                title="Couleur du texte"
              />
            </div>
            <div className="flex items-center space-x-1">
              <Palette className="w-4 h-4" />
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => {
                  setBackgroundColor(e.target.value);
                  execCommand('backColor', e.target.value);
                }}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                title="Couleur de fond"
              />
            </div>
          </div>

          {/* Taille de police */}
          <div className="flex items-center space-x-2 border-r border-gray-300 pr-2">
            <label className="text-sm font-medium">Taille:</label>
            <select
              value={fontSize}
              onChange={(e) => {
                setFontSize(e.target.value);
                execCommand('fontSize', e.target.value);
              }}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="12">12px</option>
              <option value="14">14px</option>
              <option value="16">16px</option>
              <option value="18">18px</option>
              <option value="20">20px</option>
              <option value="24">24px</option>
              <option value="28">28px</option>
              <option value="32">32px</option>
            </select>
          </div>

          {/* Police */}
          <div className="flex items-center space-x-2 border-r border-gray-300 pr-2">
            <label className="text-sm font-medium">Police:</label>
            <select
              value={fontFamily}
              onChange={(e) => {
                setFontFamily(e.target.value);
                execCommand('fontName', e.target.value);
              }}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Verdana">Verdana</option>
              <option value="Georgia">Georgia</option>
              <option value="Helvetica">Helvetica</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => execCommand('undo')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Annuler"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand('redo')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Refaire"
            >
              <Redo className="w-4 h-4" />
            </button>
            <button
              onClick={togglePreview}
              className={`p-2 rounded ${isPreviewMode ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
              title="Aperçu"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Variables disponibles */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Variables disponibles :</h4>
          <div className="flex flex-wrap gap-2">
            {availableVariables.map((variable) => (
              <button
                key={variable.name}
                onClick={() => insertVariable(variable.name)}
                className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs rounded-full border border-blue-200"
                title={`${variable.label} (ex: ${variable.example})`}
              >
                {variable.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Zone d'édition */}
      <div className="border border-gray-200 border-t-0 rounded-b-lg">
        {isPreviewMode ? (
          <div className="p-6 bg-white min-h-[400px]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Aperçu du template</h3>
              <button
                onClick={togglePreview}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retour à l'édition
              </button>
            </div>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleContentChange}
            className="p-6 min-h-[400px] focus:outline-none"
            style={{
              fontFamily: fontFamily,
              fontSize: `${fontSize}px`,
              color: textColor,
              backgroundColor: backgroundColor
            }}
            suppressContentEditableWarning={true}
          />
        )}
      </div>

      {/* Actions en bas */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          {isPreviewMode ? 'Mode aperçu' : 'Mode édition'}
        </div>
        <div className="flex items-center space-x-2">
          {onPreview && (
            <button
              onClick={onPreview}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <Eye className="w-4 h-4 mr-2 inline" />
              Aperçu complet
            </button>
          )}
          {onSave && (
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2 inline" />
              Sauvegarder
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
