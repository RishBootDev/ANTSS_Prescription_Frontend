import { useState, useCallback } from "react";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useApi<T, Args extends any[]>(
  apiFn: (...args: Args) => Promise<T>
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: Args): Promise<T> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const result = await apiFn(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (err: any) {
        const errorInstance = err instanceof Error ? err : new Error(err?.message || "An unknown error occurred");
        setState({ data: null, loading: false, error: errorInstance });
        throw errorInstance;
      }
    },
    [apiFn]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
