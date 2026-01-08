import React from 'react';
import { 
  GraduationCap,
  FileCheck,
  FileText,
  Receipt,
  FileType,
  BookOpen,
  Building,
  DollarSign,
  Star,
  StarOff,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Circle,
  X
} from 'lucide-react';

interface IconProps {
  className?: string;
}

export const DocumentTypeIcons = {
  // Types de documents
  bulletin: (props: IconProps) => <GraduationCap {...props} />,
  certificat: (props: IconProps) => <FileCheck {...props} />,
  convocation: (props: IconProps) => <FileText {...props} />,
  attestation: (props: IconProps) => <FileCheck {...props} />,
  facture: (props: IconProps) => <Receipt {...props} />,
  reçu: (props: IconProps) => <Receipt {...props} />,
  other: (props: IconProps) => <FileType {...props} />,
  
  // Catégories
  academique: (props: IconProps) => <BookOpen {...props} />,
  administratif: (props: IconProps) => <Building {...props} />,
  financier: (props: IconProps) => <DollarSign {...props} />,
  autre: (props: IconProps) => <FileType {...props} />,
  
  // Actions et statuts
  star: (props: IconProps) => <Star {...props} />,
  starOff: (props: IconProps) => <StarOff {...props} />,
  check: (props: IconProps) => <CheckCircle {...props} />,
  alert: (props: IconProps) => <AlertCircle {...props} />,
  chevronDown: (props: IconProps) => <ChevronDown {...props} />,
  circle: (props: IconProps) => <Circle {...props} />,
  close: (props: IconProps) => <X {...props} />
};

export const getDocumentTypeIcon = (documentType: string, className: string = "w-4 h-4") => {
  const IconComponent = DocumentTypeIcons[documentType as keyof typeof DocumentTypeIcons] || DocumentTypeIcons.other;
  return <IconComponent className={className} />;
};

export const getCategoryIcon = (category: string, className: string = "w-5 h-5") => {
  const IconComponent = DocumentTypeIcons[category as keyof typeof DocumentTypeIcons] || DocumentTypeIcons.autre;
  return <IconComponent className={className} />;
};

export default DocumentTypeIcons;
