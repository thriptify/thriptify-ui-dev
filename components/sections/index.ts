// Section types
export * from './types';

// Section renderer (SDUI-powered)
export { SectionRenderer } from './SectionRenderer';

// SDUI utilities (for advanced usage)
export {
  ComponentRegistry,
  registerComponent,
  hasComponent,
  SDUIActions,
  getSeeAllUrl,
  buildActionFromSection,
  SDUILayout,
  getLayoutConfig,
  getCategoryGridSize,
} from './SectionRenderer';
