/**
 * SDUI Component Registry
 *
 * Maps section types to their render components.
 * This is the core of Server-Driven UI - the backend tells us
 * what section type to render, and we look it up here.
 */

import type { Section, SectionType } from '@thriptify/api-types';
import type { SectionRendererProps } from '../types';

// =============================================================================
// TYPES
// =============================================================================

export type SectionComponent = (
  section: Section,
  props: SectionRendererProps
) => React.ReactNode;

export interface ComponentRegistryEntry {
  /** The component function to render this section type */
  component: SectionComponent;
  /** Fallback section type if this component fails to load */
  fallback?: SectionType;
  /** Minimum app version required for this component */
  minVersion?: string;
}

// =============================================================================
// REGISTRY
// =============================================================================

const registry = new Map<SectionType | string, ComponentRegistryEntry>();

/**
 * Register a component for a section type
 */
export function registerComponent(
  sectionType: SectionType | string,
  entry: ComponentRegistryEntry
): void {
  registry.set(sectionType, entry);
}

/**
 * Get a component for a section type
 */
export function getComponent(sectionType: SectionType | string): ComponentRegistryEntry | undefined {
  return registry.get(sectionType);
}

/**
 * Check if a component is registered for a section type
 */
export function hasComponent(sectionType: SectionType | string): boolean {
  return registry.has(sectionType);
}

/**
 * Get all registered section types
 */
export function getRegisteredTypes(): string[] {
  return Array.from(registry.keys());
}

/**
 * Render a section using the registry
 * Falls back gracefully if component not found
 */
export function renderSection(
  section: Section,
  props: SectionRendererProps
): React.ReactNode {
  const entry = getComponent(section.sectionType);

  if (!entry) {
    // Unknown section type - render nothing
    // In production, you might want to log this for monitoring
    console.warn(`[SDUI] Unknown section type: ${section.sectionType}`);
    return null;
  }

  try {
    return entry.component(section, props);
  } catch (error) {
    console.error(`[SDUI] Error rendering section type: ${section.sectionType}`, error);

    // Try fallback if available
    if (entry.fallback) {
      const fallbackEntry = getComponent(entry.fallback);
      if (fallbackEntry) {
        return fallbackEntry.component(section, props);
      }
    }

    return null;
  }
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export const ComponentRegistry = {
  register: registerComponent,
  get: getComponent,
  has: hasComponent,
  getTypes: getRegisteredTypes,
  render: renderSection,
};

export default ComponentRegistry;
