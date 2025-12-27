/**
 * Banner Section Renderer
 *
 * Renders auto-playing banner carousel.
 */

import React from 'react';
import { BannerCarousel } from '../../../carousels';

import type { Section, BannerSectionItem } from '@thriptify/api-types';
import type { SectionRendererProps } from '../../types';

export function renderBanners(
  section: Section,
  props: SectionRendererProps
): React.ReactNode {
  const { onBannerPress } = props;
  const items = section.items as BannerSectionItem[];

  return (
    <BannerCarousel
      items={items.map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        image: item.imageUrl,
        backgroundColor: item.backgroundColor,
        textColor: item.textColor,
        onPress: item.linkType && item.linkId
          ? () => onBannerPress?.(item.linkType!, item.linkId!)
          : undefined,
      }))}
      autoPlay={true}
      autoPlayInterval={4000}
    />
  );
}

export default renderBanners;
