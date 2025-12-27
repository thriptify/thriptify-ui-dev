import { StyleSheet, Text, type TextProps } from 'react-native';
import { tokens } from '@thriptify/tokens/react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: tokens.typography.fontSize.base,
    lineHeight: tokens.typography.fontSize.base * tokens.typography.lineHeight.normal,
  },
  defaultSemiBold: {
    fontSize: tokens.typography.fontSize.base,
    lineHeight: tokens.typography.fontSize.base * tokens.typography.lineHeight.normal,
    fontWeight: String(tokens.typography.fontWeight.semibold) as '600',
  },
  title: {
    fontSize: tokens.typography.fontSize['4xl'],
    fontWeight: String(tokens.typography.fontWeight.bold) as 'bold',
    lineHeight: tokens.typography.fontSize['4xl'],
  },
  subtitle: {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: String(tokens.typography.fontWeight.bold) as 'bold',
  },
  link: {
    lineHeight: tokens.typography.fontSize.xl * tokens.typography.lineHeight.normal,
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.semantic.text.link,
  },
});
