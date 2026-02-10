export type AnalyticsEvent = {
  name: string;
  properties?: Record<string, string | number | boolean>;
};

export const trackEvent = async (_event: AnalyticsEvent) => {
  // Future analytics should only ship aggregated, anonymized data.
  // No individual-level data resale.
  return Promise.resolve();
};
