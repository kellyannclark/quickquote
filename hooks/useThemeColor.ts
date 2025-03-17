import { Colors } from '@/constants/Colors';

/**
 * Returns a color from Colors.ts.
 * @param colorName - The key representing a color in Colors.ts.
 * @returns The resolved color as a string.
 */
export function useThemeColor(colorName: keyof typeof Colors): string {
  return Colors[colorName];
}
