export const DEFAULT_CONTEXT_TAGS = [
  'late night',
  'rainy walk',
  'gym',
  'commute',
  'party',
  'study',
  'heartbreak',
  'focus',
  'windows down'
];

export const VISIBILITY_OPTIONS = ['public', 'followers', 'private'] as const;
export type Visibility = (typeof VISIBILITY_OPTIONS)[number];

export const FEED_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'reviews', label: 'Reviews only' },
  { id: 'private', label: 'Private diary' }
] as const;
