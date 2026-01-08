export interface WatermarkConfig {
  id: string;
  name: string;
  enabled: boolean;
  type: 'text' | 'image';
  content: string;
  opacity: number;
  position: 'center' | 'diagonal' | 'horizontal' | 'vertical';
  size: 'small' | 'medium' | 'large';
  color: string;
  rotation: number;
}

export interface HeaderConfig {
  id: string;
  name: string;
  type: 'bulletin' | 'certificat' | 'facture' | 'reçu' | 'attestation' | 'convocation';
  logoLeft?: string;
  logoRight?: string;
  schoolName: string;
  schoolAddress: string;
  schoolPhone: string;
  schoolEmail: string;
  schoolWebsite?: string;
  academicYear: string;
  slogan?: string;
  additionalText?: string;
  watermark?: WatermarkConfig;
  isDefault?: boolean;
  category?: 'academique' | 'administratif' | 'financier' | 'autre';
  description?: string;
  isActive?: boolean;
  documentTypes?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FooterConfig {
  id: string;
  name: string;
  type: 'bulletin' | 'certificat' | 'facture' | 'reçu' | 'attestation' | 'convocation';
  directorSignature?: string;
  directorName: string;
  directorTitle: string;
  legalNotice?: string;
  contactInfo?: string;
  qrCode?: boolean;
  date?: boolean;
  pageNumber?: boolean;
  watermark?: WatermarkConfig;
  isDefault?: boolean;
  category?: 'academique' | 'administratif' | 'financier' | 'autre';
  description?: string;
  isActive?: boolean;
  documentTypes?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  documentType: 'bulletin' | 'certificat' | 'facture' | 'reçu' | 'attestation' | 'convocation' | 'other';
  category: 'academique' | 'administratif' | 'financier' | 'autre';
  content: string;
  headerConfigId?: string;
  footerConfigId?: string;
  watermarkConfigId?: string;
  lastModified: string;
  isDefault: boolean;
  isActive: boolean;
  createdBy: string;
}

export interface DocumentSettingsData {
  headerFooterConfigs: (HeaderConfig | FooterConfig)[];
  templates: Template[];
  watermarkConfigs: WatermarkConfig[];
}
