'use client';

import { FEED_FILTERS } from '@/lib/constants';

export const FeedFilters = ({
  active,
  onChange
}: {
  active: string;
  onChange: (value: string) => void;
}) => {
  return (
    <div className="flex gap-2">
      {FEED_FILTERS.map((filter) => (
        <button
          key={filter.id}
          type="button"
          onClick={() => onChange(filter.id)}
          className={`tag ${active === filter.id ? 'bg-ink-900 text-white' : ''}`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};
