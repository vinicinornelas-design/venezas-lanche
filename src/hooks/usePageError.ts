import { useState, useCallback } from 'react';

interface PageError {
  hasError: boolean;
  error: Error | null;
  resetError: () => void;
  setError: (error: Error) => void;
}

export function usePageError(): PageError {
  const [hasError, setHasError] = useState(false);
  const [error, setErrorState] = useState<Error | null>(null);

  const setError = useCallback((error: Error) => {
    console.error('Page error:', error);
    setErrorState(error);
    setHasError(true);
  }, []);

  const resetError = useCallback(() => {
    setHasError(false);
    setErrorState(null);
  }, []);

  return {
    hasError,
    error,
    resetError,
    setError
  };
}
