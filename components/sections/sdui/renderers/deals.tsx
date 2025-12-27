/**
 * Deals Section Renderer
 *
 * Renders deal products with countdown timer and discount badges.
 */

import React from 'react';
import { DealCarousel } from '../../../carousels';
import { getSeeAllUrl } from '../index';

import type { Section, ProductSectionItem } from '@thriptify/api-types';
import type { SectionRendererProps } from '../../types';

export function renderDeals(
  section: Section,
  props: SectionRendererProps
): React.ReactNode {
  const { onProductPress, onSeeAll } = props;

  const items = section.items as ProductSectionItem[];
  const seeAllUrl = getSeeAllUrl(section);

  return (
    <DealCarousel
      title={section.title}
      items={items.map((item) => ({
        id: item.id,
        title: item.name,
        discount: item.discountPercent ? `${item.discountPercent}% OFF` : '',
        originalPrice: item.compareAtPrice || item.price,
        salePrice: item.dealPrice || item.price,
        image: item.imageUrl || '',
        endsIn: section.showCountdown && section.endsAt
          ? formatTimeRemaining(section.endsAt)
          : undefined,
        onPress: () => onProductPress?.(item.id),
      }))}
      onSeeAll={section.showViewAll && seeAllUrl
        ? () => onSeeAll?.(seeAllUrl)
        : undefined
      }
    />
  );
}

function formatTimeRemaining(endsAt: string): string {
  if (!endsAt) return '';

  const endTime = new Date(endsAt).getTime();
  if (isNaN(endTime)) return '';

  const now = Date.now();
  const remaining = endTime - now;

  if (remaining <= 0) return 'Ended';

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d left`;
  }

  return `${hours}h ${minutes}m left`;
}

export default renderDeals;
