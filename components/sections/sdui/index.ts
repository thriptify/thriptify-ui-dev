/**
 * SDUI (Server-Driven UI) Module
 *
 * This module provides the infrastructure for backend-controlled UI rendering.
 * The backend sends section configuration, and this module handles:
 * - Component registry (maps sectionType to React components)
 * - Layout configuration (translates displayType to layout values)
 * - Action handling (dynamic navigation from sections)
 */

export { ComponentRegistry, registerComponent, getComponent, hasComponent, renderSection } from './registry';
export type { SectionComponent, ComponentRegistryEntry } from './registry';

export { SDUIActions, buildActionFromSection, actionToUrl, getSeeAllUrl } from './actions';
export type { SDUIAction, ParsedAction } from './actions';

export { SDUILayout, getLayoutConfig, getCategoryGridSize, getProductCardWidth } from './layout';
export type { LayoutConfig, LayoutContext } from './layout';
