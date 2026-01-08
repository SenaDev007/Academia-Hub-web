import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  data: string;
  size?: number;
  style?: React.CSSProperties;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  data, 
  size = 100, 
  style = {} 
}) => {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const qrCodeDataURL = await QRCode.toDataURL(data, {
          width: size,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        });
        setQrCodeDataURL(qrCodeDataURL);
      } catch (error) {
        console.error('Erreur lors de la génération du QR code:', error);
      }
    };

    if (data) {
      generateQRCode();
    }
  }, [data, size]);

  if (!qrCodeDataURL) {
    return (
      <div style={{ 
        width: size, 
        height: size, 
        backgroundColor: '#f3f4f6', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        ...style 
      }}>
        <span style={{ fontSize: '10px', color: '#6b7280' }}>QR Code</span>
      </div>
    );
  }

  return (
    <img 
      src={qrCodeDataURL} 
      alt="QR Code" 
      style={{ 
        width: size, 
        height: size,
        ...style 
      }} 
    />
  );
};

export default QRCodeGenerator;
