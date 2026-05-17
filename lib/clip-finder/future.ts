import type { ClipIdea, Platform } from './types';

export type ClipPerformanceEvent = {
  ideaId: string;
  platform: Platform;
  postedAt: string;
  views?: number;
  averageWatchTimeSeconds?: number;
  completionRate?: number;
  saves?: number;
  shares?: number;
  comments?: number;
};

export type TrendComparison = {
  platform: Platform;
  topic: string;
  observedAt: string;
  editorialFitScore: number;
  notes: string;
};

export type ClipAnalyticsAdapter = {
  recordIdeaGenerated: (idea: ClipIdea) => Promise<void>;
  recordPerformance: (event: ClipPerformanceEvent) => Promise<void>;
  compareAgainstTrends: (idea: ClipIdea) => Promise<TrendComparison[]>;
};

export const createNoopAnalyticsAdapter = (): ClipAnalyticsAdapter => ({
  async recordIdeaGenerated() {},
  async recordPerformance() {},
  async compareAgainstTrends() {
    return [];
  }
});
