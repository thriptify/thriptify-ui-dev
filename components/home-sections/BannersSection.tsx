import React from 'react';
import { BannerCarousel, BannerItem } from '@/components/carousels';

interface BannersSectionProps {
  items: BannerItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function BannersSection({ items, autoPlay = true, autoPlayInterval = 4000 }: BannersSectionProps) {
  return (
    <BannerCarousel
      items={items}
      autoPlay={autoPlay}
      autoPlayInterval={autoPlayInterval}
    />
  );
}
