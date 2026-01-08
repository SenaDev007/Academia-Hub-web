/**
 * Tests pour le générateur de noms de reçus
 */

import { 
  generateReceiptName, 
  generateSimpleReceiptName, 
  generateCustomReceiptName,
  generatePaymentTypeReceiptName,
  generateOptimalReceiptName,
  validateReceiptName,
  formatReceiptNameForDisplay
} from '../receiptNameGenerator';

describe('ReceiptNameGenerator', () => {
  const mockOptions = {
    schoolName: 'ACADEMIA HUB',
    studentName: 'Jean Dupont',
    paymentDate: '2024-12-15T10:30:00Z',
    paymentAmount: 50000,
    paymentMethod: 'cash'
  };

  describe('generateReceiptName', () => {
    it('should generate a complete receipt name', () => {
      const result = generateReceiptName(mockOptions);
      expect(result).toMatch(/^ACADEMIA-2024-12-\d{3}-JEAN_DUPONT$/);
    });

    it('should handle missing school name', () => {
      const result = generateReceiptName({ ...mockOptions, schoolName: undefined });
      expect(result).toMatch(/^ACADEMIA-2024-12-\d{3}-JEAN_DUPONT$/);
    });

    it('should handle special characters in names', () => {
      const result = generateReceiptName({
        ...mockOptions,
        schoolName: 'École & Collège',
        studentName: 'Marie-Claire O\'Connor'
      });
      expect(result).toMatch(/^COLE-2024-12-\d{3}-MARIE_CLAIRE_O_CONNOR$/);
    });
  });

  describe('generateSimpleReceiptName', () => {
    it('should generate a simple receipt name', () => {
      const result = generateSimpleReceiptName(mockOptions);
      expect(result).toMatch(/^RECU-20241215-\d{3}$/);
    });
  });

  describe('generateCustomReceiptName', () => {
    it('should generate a custom receipt name', () => {
      const result = generateCustomReceiptName('PAY', mockOptions);
      expect(result).toMatch(/^PAY-2024-12-\d{3}$/);
    });
  });

  describe('generatePaymentTypeReceiptName', () => {
    it('should generate a payment type receipt name', () => {
      const result = generatePaymentTypeReceiptName(mockOptions);
      expect(result).toMatch(/^CASH-20241215-050000$/);
    });
  });

  describe('generateOptimalReceiptName', () => {
    it('should choose the best format based on available data', () => {
      const result = generateOptimalReceiptName(mockOptions);
      expect(result).toMatch(/^ACADEMIA-2024-12-\d{3}-JEAN_DUPONT$/);
    });

    it('should fallback to simple format with minimal data', () => {
      const result = generateOptimalReceiptName({ paymentDate: '2024-12-15T10:30:00Z' });
      expect(result).toMatch(/^RECU-20241215-\d{3}$/);
    });
  });

  describe('validateReceiptName', () => {
    it('should validate correct receipt names', () => {
      expect(validateReceiptName('ACADEMIA-2024-12-001-JEAN_DUPONT')).toBe(true);
      expect(validateReceiptName('RECU-20241215-001')).toBe(true);
    });

    it('should reject invalid receipt names', () => {
      expect(validateReceiptName('')).toBe(false);
      expect(validateReceiptName('INVALID')).toBe(false);
      expect(validateReceiptName('NO-DASHES')).toBe(false);
    });
  });

  describe('formatReceiptNameForDisplay', () => {
    it('should format receipt name for display', () => {
      const result = formatReceiptNameForDisplay('ACADEMIA-2024-12-001-JEAN_DUPONT');
      expect(result).toBe('ACADEMIA - 2024 - 12 - 001 - JEAN_DUPONT');
    });
  });
});
