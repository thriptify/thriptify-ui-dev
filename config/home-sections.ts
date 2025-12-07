// Home page section configuration
// Reorder this array to change section order on the home page
// StoryCarousel is always rendered first (order: 1) and is not configurable

export type SectionId =
  | 'banners'
  | 'deals'
  | 'bestsellers'
  | 'groceries'
  | 'featured'
  | 'recipes';

export interface SectionConfig {
  id: SectionId;
  enabled: boolean;
}

// Default section order (after StoryCarousel which is always first)
export const HOME_SECTIONS_CONFIG: SectionConfig[] = [
  { id: 'banners', enabled: true },
  { id: 'deals', enabled: true },
  { id: 'bestsellers', enabled: true },
  { id: 'groceries', enabled: true },
  { id: 'featured', enabled: true },
  { id: 'recipes', enabled: true },
];

// Helper to get enabled sections in order
export function getEnabledSections(config: SectionConfig[] = HOME_SECTIONS_CONFIG): SectionId[] {
  return config
    .filter(section => section.enabled)
    .map(section => section.id);
}
