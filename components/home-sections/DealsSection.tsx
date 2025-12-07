import React from 'react';
import { DealCarousel, DealItem } from '@/components/carousels';

interface DealsSectionProps {
  title?: string;
  items: DealItem[];
  onSeeAll?: () => void;
}

export function DealsSection({ title = 'Flash Deals', items, onSeeAll }: DealsSectionProps) {
  return (
    <DealCarousel
      title={title}
      items={items}
      onSeeAll={onSeeAll}
    />
  );
}
