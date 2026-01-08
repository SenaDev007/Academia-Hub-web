import React from 'react';
import { SchoolFeesPaymentModal, SubscriptionPaymentModal } from './index';

// This is a wrapper component that decides which payment modal to show
// based on the payment type (subscription or school fees)
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: 'subscription' | 'school_fees';
  amount: number;
  studentData?: any;
  // For subscription payments
  planName?: string;
  // For school fees payments
  studentName?: string;
  invoiceNumber?: string;
  feeType?: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  type,
  amount,
  studentData,
  planName = '',
  studentName = '',
  invoiceNumber = '',
  feeType = ''
}) => {
  // Render the appropriate payment modal based on the type
  if (type === 'subscription') {
    return (
      <SubscriptionPaymentModal
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={onSuccess}
        amount={amount}
        planName={planName}
      />
    );
  } else {
    return (
      <SchoolFeesPaymentModal
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={onSuccess}
        amount={amount}
        studentData={studentData}
        studentName={studentName}
        invoiceNumber={invoiceNumber}
        feeType={feeType}
      />
    );
  }
};

export default PaymentModal;