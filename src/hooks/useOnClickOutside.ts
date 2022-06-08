import { useEffect } from 'react';

function useOnClickOutside<T extends HTMLElement>(
  ref: React.MutableRefObject<T | null>,
  fn: () => void
): void {
  useEffect(() => {
    function handleClickOutside(event: any): void {
      if (ref.current && !ref.current.contains(event.target)) {
        fn();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, fn]);
}

export default useOnClickOutside;
