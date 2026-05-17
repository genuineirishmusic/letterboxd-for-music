export type ContentType =
  | 'interview clip'
  | 'talking-to-camera'
  | 'list video'
  | 'sponsor'
  | 'music discovery'
  | 'commentary';

export type Platform = 'Instagram Reels' | 'TikTok' | 'YouTube Shorts' | 'General';

export type ClipContext = {
  sponsor?: string;
  newRelease?: string;
  artist?: string;
  platform?: string;
  tone?: string;
  alreadyUsedClips?: string;
};

export type ClipIdea = {
  id: string;
  title: string;
  viewerScore: number;
  sponsorSafeScore: number;
  contentType: ContentType;
  exactLines: string[];
  suggestedCuts: string[];
  overlayOptions: string[];
  captionOptions: string[];
  whyItWorks: string;
  whyItMayConfuseViewers: string;
  requiresExtraContext: boolean;
};

export type ClipAnalysisRequest = {
  transcript: string;
  context?: ClipContext;
};

export type ClipAnalysisResponse = {
  ideas: ClipIdea[];
  notes: string[];
};
