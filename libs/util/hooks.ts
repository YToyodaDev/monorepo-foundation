import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to manage the open/close state of a dialog in Next.js apps.
 * Closes the dialog when the URL changes, making it convenient for partial re-renders.
 *
 * @param {boolean} [defaultState=false] - Initial state of the dialog.
 * @returns {[boolean, React.Dispatch<React.SetStateAction<boolean>>]} The open state and setter function.
 */
export const useDialogState = (defaultState = false) => {
  const [open, setOpen] = useState(defaultState);

  const pathname = usePathname();
  const initialPathname = useRef(pathname);

  useEffect(() => {
    if (pathname !== initialPathname.current) {
      setOpen(false);
      initialPathname.current = pathname;
    }
  }, [pathname, open]);

  return [open, setOpen] as const;
};
