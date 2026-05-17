import type { ClipAnalysisRequest, ClipAnalysisResponse, ClipContext, ClipIdea, ContentType } from './types';

const MAX_IDEAS = 6;
const MIN_LINE_LENGTH = 24;

const musicSignals = [
  'album',
  'artist',
  'band',
  'chorus',
  'demo',
  'festival',
  'gig',
  'guitar',
  'hook',
  'lyrics',
  'mixtape',
  'producer',
  'record',
  'release',
  'song',
  'sound',
  'studio',
  'tour',
  'track',
  'verse',
  'vocal'
];

const claritySignals = [
  'because',
  'but',
  'changed',
  'first',
  'felt',
  'remember',
  'realised',
  'realized',
  'reason',
  'so',
  'the thing',
  'what happened',
  'why'
];

const sponsorRiskSignals = ['drunk', 'hate', 'illegal', 'lawsuit', 'scam', 'stole', 'worst'];

const normalize = (value: string) => value.toLowerCase().trim();

const splitTranscript = (transcript: string) => {
  const lineBreakChunks = transcript
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const chunks = lineBreakChunks.flatMap((line) => {
    if (line.length < 180) return [line];

    const sentences = line.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [line];
    const grouped: string[] = [];
    let current = '';

    sentences.forEach((sentence) => {
      const next = `${current} ${sentence.trim()}`.trim();
      if (next.length > 220 && current) {
        grouped.push(current);
        current = sentence.trim();
      } else {
        current = next;
      }
    });

    if (current) grouped.push(current);
    return grouped;
  });

  return chunks.filter((line) => line.length >= MIN_LINE_LENGTH);
};

const countSignals = (text: string, signals: string[]) => {
  const lower = normalize(text);
  return signals.reduce((total, signal) => total + (lower.includes(signal) ? 1 : 0), 0);
};

const detectContentType = (line: string, context: ClipContext = {}): ContentType => {
  const lower = normalize(`${line} ${context.tone ?? ''} ${context.sponsor ?? ''} ${context.newRelease ?? ''}`);

  if (context.sponsor || lower.includes('sponsor') || lower.includes('partner') || lower.includes('ad ')) {
    return 'sponsor';
  }

  if (/^\s*\d+[.)]/.test(line) || lower.includes('top ') || lower.includes('three ') || lower.includes('five ')) {
    return 'list video';
  }

  if (lower.includes('interviewer:') || lower.includes('question:') || lower.includes('asked me')) {
    return 'interview clip';
  }

  if (lower.includes('i think') || lower.includes('i wanted') || lower.includes('we wanted') || lower.includes('for me')) {
    return 'talking-to-camera';
  }

  if (lower.includes('recommend') || lower.includes('discovered') || lower.includes('listen to') || lower.includes('new release')) {
    return 'music discovery';
  }

  return 'commentary';
};

const scoreLine = (line: string, context: ClipContext = {}) => {
  const words = line.split(/\s+/).filter(Boolean).length;
  const hasQuestion = line.includes('?');
  const hasContrast = /\b(but|however|except|instead|although)\b/i.test(line);
  const specificity = countSignals(line, musicSignals);
  const clarity = countSignals(line, claritySignals);
  const contextMatch = [context.artist, context.newRelease, context.sponsor]
    .filter(Boolean)
    .some((value) => normalize(line).includes(normalize(value ?? '')));

  let viewerScore = 4.6;
  viewerScore += Math.min(specificity * 0.55, 1.7);
  viewerScore += Math.min(clarity * 0.45, 1.4);
  viewerScore += hasContrast ? 0.9 : 0;
  viewerScore += hasQuestion ? 0.45 : 0;
  viewerScore += words >= 12 && words <= 42 ? 1.1 : 0;
  viewerScore += contextMatch ? 0.55 : 0;
  viewerScore -= words > 58 ? 1.1 : 0;
  viewerScore -= words < 8 ? 1 : 0;

  const sponsorRisk = countSignals(line, sponsorRiskSignals);
  let sponsorSafeScore = 8.4 - sponsorRisk * 1.4;
  sponsorSafeScore += context.sponsor ? 0.2 : 0;
  sponsorSafeScore -= /\bnot sponsored|never use|wouldn't buy\b/i.test(line) ? 2 : 0;

  return {
    viewerScore: Math.max(1, Math.min(10, Math.round(viewerScore * 10) / 10)),
    sponsorSafeScore: Math.max(1, Math.min(10, Math.round(sponsorSafeScore * 10) / 10))
  };
};

const titleFromLine = (line: string, index: number) => {
  const withoutSpeaker = line.replace(/^[A-Z][A-Za-z\s-]{0,30}:\s*/, '').trim();
  const words = withoutSpeaker.split(/\s+/).slice(0, 9).join(' ');
  return words.length > 56 ? `${words.slice(0, 53)}...` : words || `Clip idea ${index + 1}`;
};

const isAlreadyUsed = (line: string, alreadyUsedClips = '') => {
  if (!alreadyUsedClips.trim()) return false;
  const used = normalize(alreadyUsedClips);
  const lineKey = normalize(line).slice(0, 80);
  return Boolean(lineKey && used.includes(lineKey));
};

const contextLabel = (context: ClipContext = {}) => {
  const parts = [context.artist, context.newRelease, context.platform, context.tone].filter(Boolean);
  return parts.length ? parts.join(' · ') : 'the clip';
};

const buildIdea = (line: string, index: number, allLines: string[], context: ClipContext = {}): ClipIdea => {
  const previousLine = allLines[index - 1];
  const nextLine = allLines[index + 1];
  const lines = [line];
  const type = detectContentType(line, context);
  const scores = scoreLine(line, context);
  const needsSetup = !context.artist && !/[A-Z][a-z]+/.test(line) && type !== 'list video';
  const platform = context.platform || 'short-form';
  const subject = context.artist || context.newRelease || 'this music story';

  return {
    id: `idea-${index}-${line.length}`,
    title: titleFromLine(line, index),
    viewerScore: scores.viewerScore,
    sponsorSafeScore: scores.sponsorSafeScore,
    contentType: type,
    exactLines: lines,
    suggestedCuts: [
      previousLine ? 'Start after the previous setup line unless it contains essential names or dates.' : 'Open directly on the selected line.',
      'Keep the spoken section intact; do not rewrite the wording.',
      nextLine && nextLine.length < 180 ? 'Consider ending on the next line if it resolves the thought.' : 'Cut out as soon as the idea resolves.'
    ],
    overlayOptions: [
      context.sponsor ? `Small sponsor label: ${context.sponsor}` : `Plain context card: ${subject}`,
      type === 'list video' ? 'Numbered title card for the item being discussed' : `One-line explainer for ${contextLabel(context)}`,
      'Lower-third with artist, track, or release name if not already clear from the audio'
    ],
    captionOptions: [
      context.artist ? `${context.artist}: the clearest short-form angle from this section.` : 'A clean editorial cut from the transcript.',
      context.newRelease ? `A short setup for ${context.newRelease}, without adding fake stakes.` : `A ${platform} clip led by the strongest exact wording.`,
      'The quote is doing the work here — keep the caption simple.'
    ],
    whyItWorks:
      'It has a contained thought, enough specificity to feel editorial, and can be presented without manufacturing a bigger narrative.',
    whyItMayConfuseViewers: needsSetup
      ? 'The line may not name the artist, release, or situation, so viewers could need a quick visual setup.'
      : 'It should be clear, but viewers may still need a lower-third if this appears outside the original video.',
    requiresExtraContext: needsSetup
  };
};

export const analyzeClipIdeas = ({ transcript, context = {} }: ClipAnalysisRequest): ClipAnalysisResponse => {
  const lines = splitTranscript(transcript);

  if (!transcript.trim()) {
    return {
      ideas: [],
      notes: ['Paste a transcript or script to generate ranked ideas.']
    };
  }

  if (!lines.length) {
    return {
      ideas: [],
      notes: ['The text is too short to identify reliable short-form clip ideas. Add more transcript detail.']
    };
  }

  const ideas = lines
    .map((line, index) => buildIdea(line, index, lines, context))
    .filter((idea) => !isAlreadyUsed(idea.exactLines.join(' '), context.alreadyUsedClips))
    .sort((a, b) => b.viewerScore + b.sponsorSafeScore * 0.25 - (a.viewerScore + a.sponsorSafeScore * 0.25))
    .slice(0, MAX_IDEAS)
    .map((idea, rank) => ({ ...idea, id: `${idea.id}-rank-${rank + 1}` }));

  return {
    ideas,
    notes: [
      'Spoken edit suggestions use exact transcript wording only.',
      'Captions and overlays are written as optional packaging, not invented dialogue.',
      context.alreadyUsedClips ? 'Ideas matching already-used clip notes were deprioritised or removed.' : 'Add already-used clips to avoid repeat recommendations.'
    ]
  };
};
