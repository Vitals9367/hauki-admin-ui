import React from 'react';
import HaukiNavigation from '../navigation/HaukiNavigation';
import HaukiFooter from '../footer/HaukiFooter';
import { Language } from '../../common/lib/types';

interface Props {
  children: React.ReactNode;
  language: Language;
  onLanguageChanged: (language: Language) => void;
}

export default function NavigationAndFooterWrapper({
  children,
  language,
  onLanguageChanged,
}: Props): JSX.Element {
  return (
    <>
      <HaukiNavigation
        language={language}
        onLanguageChanged={onLanguageChanged}
      />
      {children}
      <HaukiFooter />
    </>
  );
}
