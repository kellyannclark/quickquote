import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * Custom hook to get the color scheme on the web.
 * Ensures the color scheme is only set after hydration.
 * Defaults to 'light' mode before hydration is complete.
 */
export function useColorScheme() {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const systemScheme = useRNColorScheme();
    setColorScheme(systemScheme ?? 'light'); // Default to 'light' if undefined
  }, []);

  return colorScheme;
}
