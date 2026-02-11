import { createContext, useContext } from 'react';

export const LanguageContext = createContext();

// LanguageProvider moved to ./LanguageProvider.jsx

 
export const useLanguage = () => useContext(LanguageContext);
