import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { tokens } from '@thriptify/tokens/react-native';

export default function TokensScreen() {
  const { colors, spacing, typography, radius, opacity, blur } = tokens;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Design Tokens Showcase</Text>
      <Text style={styles.subtitle}>All tokens from @thriptify/tokens</Text>

      {/* General Tokens Section */}
      <View style={styles.themeSection}>
        <Text style={styles.themeTitle}>General Tokens</Text>
        
        {/* Spacing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spacing Scale</Text>
          {[0, 1, 2, 4, 8, 12, 16, 24].map((size) => (
            <View key={size} style={styles.spacingExample}>
              <View style={[styles.spacingBox, { width: spacing[size as keyof typeof spacing] }]} />
              <Text style={styles.spacingLabel}>{size}: {spacing[size as keyof typeof spacing]}px</Text>
            </View>
          ))}
        </View>

        {/* Typography */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Typography</Text>
          <Text style={[styles.typographyExample, { fontSize: typography.fontSize.xs }]}>
            Extra Small (xs) - {typography.fontSize.xs}px
          </Text>
          <Text style={[styles.typographyExample, { fontSize: typography.fontSize.sm }]}>
            Small (sm) - {typography.fontSize.sm}px
          </Text>
          <Text style={[styles.typographyExample, { fontSize: typography.fontSize.base }]}>
            Base - {typography.fontSize.base}px
          </Text>
          <Text style={[styles.typographyExample, { fontSize: typography.fontSize.lg }]}>
            Large (lg) - {typography.fontSize.lg}px
          </Text>
          <Text style={[styles.typographyExample, { fontSize: typography.fontSize.xl }]}>
            Extra Large (xl) - {typography.fontSize.xl}px
          </Text>
          <Text style={[styles.typographyExample, { fontSize: typography.fontSize['2xl'] }]}>
            2XL - {typography.fontSize['2xl']}px
          </Text>
        </View>

        {/* Radius */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Border Radius</Text>
          <View style={styles.radiusRow}>
            {Object.entries(radius).map(([key, value]) => (
              <View key={key} style={styles.radiusExample}>
                <View
                  style={[
                    styles.radiusBox,
                    {
                      borderRadius: value,
                      backgroundColor: colors.semantic.brand.primary.default,
                    },
                  ]}
                />
                <Text style={styles.radiusLabel}>{key}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Opacity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opacity Scale</Text>
          <View style={styles.opacityGrid}>
            {Object.entries(opacity)
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([key, value]) => (
                <View key={key} style={styles.opacityExample}>
                  <View style={styles.opacityContainer}>
                    <View style={styles.stripeBackground}>
                      <View style={[styles.stripe, styles.stripeWhite]} />
                      <View style={[styles.stripe, styles.stripeGray]} />
                      <View style={[styles.stripe, styles.stripeWhite]} />
                      <View style={[styles.stripe, styles.stripeGray]} />
                    </View>
                    <View
                      style={[
                        styles.opacityBox,
                        {
                          backgroundColor: colors.semantic.brand.primary.default,
                          opacity: value,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.opacityLabel}>{key}%</Text>
                  <Text style={styles.opacityValue}>{value}</Text>
                </View>
              ))}
          </View>
        </View>
      </View>

      {/* Shared Colors Section */}
      <View style={styles.themeSection}>
        <Text style={styles.themeTitle}>Shared Colors</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Colors</Text>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: colors.semantic.brand.primary.default }]}>
              <Text style={styles.colorLabel}>Primary</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: colors.semantic.brand.secondary.default }]}>
              <Text style={styles.colorLabel}>Secondary</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: colors.semantic.status.success.default }]}>
              <Text style={styles.colorLabel}>Success</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: colors.semantic.status.error.default }]}>
              <Text style={styles.colorLabel}>Danger</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: colors.semantic.status.warning.default }]}>
              <Text style={styles.colorLabel}>Warning</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Surface Colors</Text>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: colors.semantic.surface.primary }]}>
              <Text style={[styles.colorLabel, { color: colors.semantic.text.primary }]}>Primary</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: colors.semantic.surface.secondary }]}>
              <Text style={[styles.colorLabel, { color: colors.semantic.text.primary }]}>Secondary</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: colors.semantic.surface.tertiary }]}>
              <Text style={[styles.colorLabel, { color: colors.semantic.text.primary }]}>Tertiary</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Groceries Theme Section */}
      <View style={styles.themeSection}>
        <Text style={styles.themeTitle}>Groceries Theme (Blue)</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Primary Colors</Text>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: colors.alias.groceries.primary.default }]}>
              <Text style={styles.colorLabel}>Primary</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: colors.alias.groceries.primary.hover }]}>
              <Text style={styles.colorLabel}>Hover</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: colors.alias.groceries.primary.active }]}>
              <Text style={styles.colorLabel}>Active</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: colors.alias.groceries.primary.subtle }]}>
              <Text style={[styles.colorLabel, { color: colors.alias.groceries.primary.default }]}>Subtle</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Secondary & Accent</Text>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: colors.alias.groceries.secondary.default }]}>
              <Text style={styles.colorLabel}>Secondary</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: colors.alias.groceries.accent.default }]}>
              <Text style={styles.colorLabel}>Accent</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Component Examples</Text>
          <View style={styles.componentExample}>
            <View style={[styles.componentBox, { backgroundColor: colors.mapped.groceries.button.primary.bg }]}>
              <Text style={styles.componentLabel}>Button Primary</Text>
            </View>
            <View style={[styles.componentBox, { backgroundColor: colors.mapped.groceries.badge.bg, borderColor: colors.mapped.groceries.badge.border, borderWidth: 1 }]}>
              <Text style={[styles.componentLabel, { color: colors.mapped.groceries.badge.text }]}>Badge</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Recipes Theme Section */}
      <View style={styles.themeSection}>
        <Text style={styles.themeTitle}>Recipes Theme (Green)</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Primary Colors</Text>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: colors.alias.recipes.primary.default }]}>
              <Text style={styles.colorLabel}>Primary</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: colors.alias.recipes.primary.hover }]}>
              <Text style={styles.colorLabel}>Hover</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: colors.alias.recipes.primary.active }]}>
              <Text style={styles.colorLabel}>Active</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: colors.alias.recipes.primary.subtle }]}>
              <Text style={[styles.colorLabel, { color: colors.alias.recipes.primary.default }]}>Subtle</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Secondary & Accent</Text>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: colors.alias.recipes.secondary.default }]}>
              <Text style={styles.colorLabel}>Secondary</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: colors.alias.recipes.accent.default }]}>
              <Text style={styles.colorLabel}>Accent</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Component Examples</Text>
          <View style={styles.componentExample}>
            <View style={[styles.componentBox, { backgroundColor: colors.mapped.recipes.button.primary.bg }]}>
              <Text style={styles.componentLabel}>Button Primary</Text>
            </View>
            <View style={[styles.componentBox, { backgroundColor: colors.mapped.recipes.badge.bg, borderColor: colors.mapped.recipes.badge.border, borderWidth: 1 }]}>
              <Text style={[styles.componentLabel, { color: colors.mapped.recipes.badge.text }]}>Badge</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Glass Theme Section */}
      <View style={styles.glassThemeSection}>
        {/* Background Pattern for Blur Demo */}
        <View style={styles.glassBackground}>
          <View style={styles.gradientRow}>
            <View style={[styles.gradientBox, { backgroundColor: colors.alias.groceries.primary.default }]} />
            <View style={[styles.gradientBox, { backgroundColor: colors.alias.recipes.primary.default }]} />
            <View style={[styles.gradientBox, { backgroundColor: colors.semantic.brand.primary.default }]} />
            <View style={[styles.gradientBox, { backgroundColor: colors.semantic.status.success.default }]} />
          </View>
          <View style={styles.gradientRow}>
            <View style={[styles.gradientBox, { backgroundColor: colors.semantic.status.warning.default }]} />
            <View style={[styles.gradientBox, { backgroundColor: colors.semantic.status.error.default }]} />
            <View style={[styles.gradientBox, { backgroundColor: colors.alias.groceries.accent.default }]} />
            <View style={[styles.gradientBox, { backgroundColor: colors.alias.recipes.accent.default }]} />
          </View>
          <View style={styles.gradientRow}>
            <View style={[styles.gradientBox, { backgroundColor: colors.alias.groceries.primary.default }]} />
            <View style={[styles.gradientBox, { backgroundColor: colors.alias.recipes.primary.default }]} />
            <View style={[styles.gradientBox, { backgroundColor: colors.semantic.brand.primary.default }]} />
            <View style={[styles.gradientBox, { backgroundColor: colors.semantic.status.success.default }]} />
          </View>
        </View>

        <Text style={styles.themeTitle}>Glass Theme (Apple Liquid Glass)</Text>
        
        {/* Blur Demonstration Section */}
        <View style={styles.blurDemoSection}>
          <Text style={styles.sectionTitle}>Blur Effect Demonstration</Text>
          <Text style={styles.demoSubtitle}>Glass surfaces over colorful background</Text>
          
          <View style={styles.blurDemoContainer}>
            <View style={[styles.glassDemoCard, { backgroundColor: colors.alias.glass.surface.primary, borderColor: colors.alias.glass.border.default }]}>
              <Text style={[styles.glassDemoLabel, { color: colors.semantic.text.primary }]}>Blur: {blur.sm}px</Text>
              <Text style={[styles.glassDemoText, { color: colors.semantic.text.secondary }]}>Small blur</Text>
            </View>
            <View style={[styles.glassDemoCard, { backgroundColor: colors.alias.glass.surface.secondary, borderColor: colors.alias.glass.border.light }]}>
              <Text style={[styles.glassDemoLabel, { color: colors.semantic.text.primary }]}>Blur: {blur.md}px</Text>
              <Text style={[styles.glassDemoText, { color: colors.semantic.text.secondary }]}>Medium blur</Text>
            </View>
            <View style={[styles.glassDemoCard, { backgroundColor: colors.alias.glass.surface.tertiary, borderColor: colors.alias.glass.border.subtle }]}>
              <Text style={[styles.glassDemoLabel, { color: colors.semantic.text.primary }]}>Blur: {blur.lg}px</Text>
              <Text style={[styles.glassDemoText, { color: colors.semantic.text.secondary }]}>Large blur</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Glass Surfaces</Text>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: colors.alias.glass.surface.primary }]}>
              <Text style={[styles.colorLabel, { color: colors.semantic.text.primary }]}>Primary</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: colors.alias.glass.surface.secondary }]}>
              <Text style={[styles.colorLabel, { color: colors.semantic.text.primary }]}>Secondary</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: colors.alias.glass.surface.tertiary }]}>
              <Text style={[styles.colorLabel, { color: colors.semantic.text.primary }]}>Tertiary</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: colors.alias.glass.surface.dark }]}>
              <Text style={styles.colorLabel}>Dark</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Glass Borders</Text>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: colors.alias.glass.border.light, borderWidth: 2, borderColor: colors.semantic.border.default }]}>
              <Text style={[styles.colorLabel, { color: colors.semantic.text.primary }]}>Light</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: colors.alias.glass.border.default, borderWidth: 2, borderColor: colors.semantic.border.default }]}>
              <Text style={[styles.colorLabel, { color: colors.semantic.text.primary }]}>Default</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: colors.alias.glass.border.subtle, borderWidth: 2, borderColor: colors.semantic.border.default }]}>
              <Text style={[styles.colorLabel, { color: colors.semantic.text.primary }]}>Subtle</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Blur Values</Text>
          <View style={styles.blurRow}>
            {Object.entries(blur).map(([key, value]) => (
              <View key={key} style={styles.blurExample}>
                <Text style={styles.blurLabel}>{key}</Text>
                <Text style={styles.blurValue}>{value}px</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Glass Shadows</Text>
          <View style={styles.shadowRow}>
            <View style={[styles.shadowBox, { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 }]}>
              <Text style={styles.shadowLabel}>Small</Text>
            </View>
            <View style={[styles.shadowBox, { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 5 }]}>
              <Text style={styles.shadowLabel}>Medium</Text>
            </View>
            <View style={[styles.shadowBox, { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.16, shadowRadius: 24, elevation: 8 }]}>
              <Text style={styles.shadowLabel}>Large</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Component Examples</Text>
          <View style={styles.componentExample}>
            <View style={[styles.componentBox, { backgroundColor: colors.mapped.glass.button.primary.bg, borderWidth: 1, borderColor: colors.mapped.glass.button.primary.border }]}>
              <Text style={[styles.componentLabel, { color: colors.mapped.glass.button.primary.text }]}>Glass Button</Text>
            </View>
            <View style={[styles.componentBox, { backgroundColor: colors.mapped.glass.card.bg, borderWidth: 1, borderColor: colors.mapped.glass.card.border }]}>
              <Text style={[styles.componentLabel, { color: colors.semantic.text.primary }]}>Glass Card</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.semantic.surface.primary,
  },
  content: {
    padding: tokens.spacing[4],
  },
  title: {
    fontSize: tokens.typography.fontSize['3xl'],
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.semantic.text.primary,
    marginBottom: tokens.spacing[2],
  },
  subtitle: {
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.semantic.text.secondary,
    marginBottom: tokens.spacing[6],
  },
  themeSection: {
    marginBottom: tokens.spacing[8],
    padding: tokens.spacing[4],
    backgroundColor: tokens.colors.semantic.surface.secondary,
    borderRadius: tokens.radius.xl,
    borderWidth: 2,
    borderColor: tokens.colors.semantic.border.subtle,
  },
  glassThemeSection: {
    marginBottom: tokens.spacing[8],
    padding: tokens.spacing[4],
    backgroundColor: tokens.colors.semantic.surface.secondary,
    borderRadius: tokens.radius.xl,
    borderWidth: 2,
    borderColor: tokens.colors.semantic.border.subtle,
    overflow: 'hidden',
    position: 'relative',
  },
  glassBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  gradientRow: {
    flexDirection: 'row',
    height: 40,
  },
  gradientBox: {
    flex: 1,
  },
  blurDemoSection: {
    marginBottom: tokens.spacing[6],
    padding: tokens.spacing[4],
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.subtle,
    backgroundColor: 'transparent',
    position: 'relative',
    zIndex: 1,
  },
  demoSubtitle: {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.semantic.text.secondary,
    marginBottom: tokens.spacing[4],
  },
  blurDemoContainer: {
    flexDirection: 'row',
    gap: tokens.spacing[3],
    flexWrap: 'wrap',
  },
  glassDemoCard: {
    flex: 1,
    minWidth: 100,
    padding: tokens.spacing[4],
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  glassDemoLabel: {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.semibold,
    marginBottom: tokens.spacing[1],
  },
  glassDemoText: {
    fontSize: tokens.typography.fontSize.sm,
  },
  themeTitle: {
    fontSize: tokens.typography.fontSize['2xl'],
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.semantic.text.primary,
    marginBottom: tokens.spacing[4],
    textAlign: 'center',
  },
  section: {
    marginBottom: tokens.spacing[6],
    padding: tokens.spacing[4],
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.subtle,
  },
  sectionTitle: {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.semantic.text.primary,
    marginBottom: tokens.spacing[4],
  },
  colorRow: {
    flexDirection: 'row',
    gap: tokens.spacing[2],
    flexWrap: 'wrap',
  },
  colorBox: {
    width: 80,
    height: 80,
    borderRadius: tokens.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.subtle,
  },
  colorLabel: {
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.semantic.text.inverse,
  },
  spacingExample: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing[2],
  },
  spacingBox: {
    height: 20,
    backgroundColor: tokens.colors.semantic.brand.primary.default,
    borderRadius: tokens.radius.sm,
    marginRight: tokens.spacing[2],
  },
  spacingLabel: {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.semantic.text.secondary,
  },
  typographyExample: {
    color: tokens.colors.semantic.text.primary,
    marginBottom: tokens.spacing[2],
    fontFamily: tokens.typography.fontFamily.sans,
  },
  radiusRow: {
    flexDirection: 'row',
    gap: tokens.spacing[4],
    flexWrap: 'wrap',
  },
  radiusExample: {
    alignItems: 'center',
  },
  radiusBox: {
    width: 60,
    height: 60,
    marginBottom: tokens.spacing[1],
  },
  radiusLabel: {
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.semantic.text.secondary,
  },
  opacityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing[3],
  },
  opacityExample: {
    alignItems: 'center',
    width: 70,
  },
  opacityContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    marginBottom: tokens.spacing[1],
    borderRadius: tokens.radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.subtle,
  },
  stripeBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  stripe: {
    width: '100%',
    height: '25%',
  },
  stripeWhite: {
    backgroundColor: tokens.colors.semantic.surface.primary,
  },
  stripeGray: {
    backgroundColor: tokens.colors.semantic.border.subtle,
  },
  opacityBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  opacityLabel: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.semantic.text.primary,
    marginBottom: tokens.spacing[0.5],
  },
  opacityValue: {
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.semantic.text.secondary,
  },
  blurRow: {
    flexDirection: 'row',
    gap: tokens.spacing[3],
    flexWrap: 'wrap',
  },
  blurExample: {
    alignItems: 'center',
    padding: tokens.spacing[3],
    backgroundColor: tokens.colors.semantic.surface.secondary,
    borderRadius: tokens.radius.md,
    minWidth: 70,
  },
  blurLabel: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.semantic.text.primary,
    marginBottom: tokens.spacing[1],
  },
  blurValue: {
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.semantic.text.secondary,
  },
  shadowRow: {
    flexDirection: 'row',
    gap: tokens.spacing[4],
    flexWrap: 'wrap',
  },
  shadowBox: {
    width: 100,
    height: 80,
    backgroundColor: tokens.colors.semantic.surface.primary,
    borderRadius: tokens.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.semantic.border.subtle,
  },
  shadowLabel: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.semantic.text.primary,
  },
  componentExample: {
    flexDirection: 'row',
    gap: tokens.spacing[3],
    flexWrap: 'wrap',
  },
  componentBox: {
    padding: tokens.spacing[3],
    borderRadius: tokens.radius.md,
    minWidth: 120,
    alignItems: 'center',
  },
  componentLabel: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.semantic.text.inverse,
  },
});
