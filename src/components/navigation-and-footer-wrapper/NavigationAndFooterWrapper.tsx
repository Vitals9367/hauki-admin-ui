import React from 'react';
import HaukiNavigation from '../navigation/HaukiNavigation';
import HaukiFooter from '../footer/HaukiFooter';

interface Props {
  children: React.ReactNode;
}

export default function NavigationAndFooterWrapper({
  children,
}: Props): JSX.Element {
  return (
    <>
      <HaukiNavigation />
      {children}
      <HaukiFooter />
    </>
  );
}
