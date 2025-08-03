import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthModalContextType {
  showAuthModal: (mode?: 'signup' | 'signin', title?: string, description?: string) => void;
  hideAuthModal: () => void;
  isOpen: boolean;
  mode: 'signup' | 'signin';
  title?: string;
  description?: string;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};

interface AuthModalProviderProps {
  children: ReactNode;
}

export const AuthModalProvider: React.FC<AuthModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [title, setTitle] = useState<string>();
  const [description, setDescription] = useState<string>();

  const showAuthModal = (modalMode: 'signup' | 'signin' = 'signup', modalTitle?: string, modalDescription?: string) => {
    setMode(modalMode);
    setTitle(modalTitle);
    setDescription(modalDescription);
    setIsOpen(true);
  };

  const hideAuthModal = () => {
    setIsOpen(false);
    setTitle(undefined);
    setDescription(undefined);
  };

  const value: AuthModalContextType = {
    showAuthModal,
    hideAuthModal,
    isOpen,
    mode,
    title,
    description,
  };

  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
}; 