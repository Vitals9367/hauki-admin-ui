import { Context, createContext, useContext } from 'react';
import { Language } from './common/lib/types';

export type AppContextProps = {
  hasOpenerWindow: boolean;
  closeAppWindow: () => void;
  language: Language;
  setLanguage: (language: Language) => void;
};

export const AppContext: Context<{}> = createContext({});

export function useAppContext(): Partial<AppContextProps> {
  return useContext(AppContext);
}
