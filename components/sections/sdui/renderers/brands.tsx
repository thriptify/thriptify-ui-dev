/**
 * Brands Section Renderer
 *
 * Renders brand cards in horizontal scroll.
 */

import React from 'react';
import { View } from 'react-native';

import {
  SectionHeader,
  HorizontalCarousel,
  BrandCard,
  sectionStyles,
} from '../../../shared';
import { getSeeAllUrl } from '../index';

import type { Section, BrandSectionItem } from '@thriptify/api-types';
import type { SectionRendererProps } from '../../types';

export function renderBrands(
  section: Section,
  props: SectionRendererProps
): React.ReactNode {
  const { onBrandPress, onSeeAll } = props;

  const items = section.items as BrandSectionItem[];
  const seeAllUrl = getSeeAllUrl(section);

  return (
    <View style={sectionStyles.section}>
      <SectionHeader
        title={section.title}
        onSeeAll={section.showViewAll && seeAllUrl
          ? () => onSeeAll?.(seeAllUrl)
          : undefined
        }
      />
      <HorizontalCarousel>
        {items.map((item) => (
          <BrandCard
            key={item.id}
            id={item.id}
            name={item.name}
            logoUrl={item.logoUrl}
            onPress={() => onBrandPress?.(item.id)}
          />
        ))}
      </HorizontalCarousel>
    </View>
  );
}

export default renderBrands;
