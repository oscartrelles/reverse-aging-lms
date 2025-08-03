import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ContactModalContextType {
  isContactModalOpen: boolean;
  openContactModal: () => void;
  closeContactModal: () => void;
}

const ContactModalContext = createContext<ContactModalContextType | undefined>(undefined);

export const useContactModal = () => {
  const context = useContext(ContactModalContext);
  if (context === undefined) {
    throw new Error('useContactModal must be used within a ContactModalProvider');
  }
  return context;
};

interface ContactModalProviderProps {
  children: ReactNode;
}

export const ContactModalProvider: React.FC<ContactModalProviderProps> = ({ children }) => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const openContactModal = () => {
    setIsContactModalOpen(true);
  };

  const closeContactModal = () => {
    setIsContactModalOpen(false);
  };

  return (
    <ContactModalContext.Provider
      value={{
        isContactModalOpen,
        openContactModal,
        closeContactModal,
      }}
    >
      {children}
    </ContactModalContext.Provider>
  );
}; 