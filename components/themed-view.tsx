import { View, type ViewProps } from 'react-native';
import { useThemeColor } from '../hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  transparent?: boolean;
};

export function ThemedView({ style, lightColor, darkColor, transparent, ...otherProps }: ThemedViewProps) {
  const defaultBackgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  const backgroundColor = transparent ? 'transparent' : defaultBackgroundColor;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}