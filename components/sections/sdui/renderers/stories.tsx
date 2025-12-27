/**
 * Stories Section Renderer
 *
 * Renders Instagram-style story carousel.
 */

import React from 'react';
import { StoryCarousel } from '../../../carousels';

import type { Section, StorySectionItem } from '@thriptify/api-types';
import type { SectionRendererProps } from '../../types';

export function renderStories(
  section: Section,
  _props: SectionRendererProps
): React.ReactNode {
  const items = section.items as StorySectionItem[];

  return (
    <StoryCarousel
      items={items.map((item) => ({
        id: item.id,
        title: item.title,
        image: item.thumbnailUrl,
        isNew: item.hasUnviewed,
        slides: item.items.map((slide) => ({
          id: slide.id,
          image: slide.type === 'image' ? slide.mediaUrl : (slide.thumbnailUrl || slide.mediaUrl),
          caption: slide.linkText || undefined,
          link: slide.linkId ? {
            text: slide.linkText || 'View',
            url: `/${slide.linkType}/${slide.linkId}`,
          } : undefined,
        })),
      }))}
    />
  );
}

export default renderStories;
