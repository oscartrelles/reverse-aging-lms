import React from 'react';
import ContactModal from './ContactModal';
import { useContactModal } from '../contexts/ContactModalContext';

const ContactModalWrapper: React.FC = () => {
  const { isContactModalOpen, closeContactModal } = useContactModal();

  return (
    <ContactModal
      open={isContactModalOpen}
      onClose={closeContactModal}
    />
  );
};

export default ContactModalWrapper; 