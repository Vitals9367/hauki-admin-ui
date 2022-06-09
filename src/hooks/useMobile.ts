import { useEffect, useState } from 'react';

const mobileBreakpoint = 768;
const checkIfMobile = (): boolean =>
  (typeof window !== 'undefined' && window.innerWidth < mobileBreakpoint) ||
  false;

const useMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateState = (): void => setIsMobile(checkIfMobile());
    window.addEventListener('resize', updateState);
    updateState();
    return (): void => window.removeEventListener('resize', updateState);
  }, []);

  return isMobile;
};

export default useMobile;
