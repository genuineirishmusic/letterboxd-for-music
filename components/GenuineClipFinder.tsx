'use client';

import { FormEvent, useMemo, useState } from 'react';
import type { ClipAnalysisResponse, ClipContext, ClipIdea } from '@/lib/clip-finder/types';

const sampleTranscript = `Interviewer: When did the song start to make sense to you?
Artist: It only clicked when we stopped trying to make it sound bigger than it was.
Artist: The first demo was almost too polished, and it lost the feeling of the room.
Artist: Once we kept the cracked vocal and the small guitar part, the whole record had somewhere to go.`;

const fieldClass = 'input min-h-0';

const ScorePill = ({ label, score }: { label: string; score: number }) => (
  <span className="rounded-full border border-ink-800/10 bg-ink-800/5 px-3 py-1 text-xs font-semibold text-ink-700">
    {label}: {score}/10
  </span>
);

const DetailList = ({ title, items }: { title: string; items: string[] }) => (
  <div>
    <h4 className="text-sm font-semibold text-ink-900">{title}</h4>
    <ul className="mt-2 space-y-2 text-sm text-ink-600">
      {items.map((item) => (
        <li key={item} className="rounded-xl bg-ink-800/5 p-3">
          {item}
        </li>
      ))}
    </ul>
  </div>
);

const IdeaDetails = ({ idea }: { idea: ClipIdea }) => (
  <div className="mt-5 space-y-5 border-t border-ink-800/10 pt-5">
    <DetailList title="Exact lines to use" items={idea.exactLines} />
    <DetailList title="Suggested cuts" items={idea.suggestedCuts} />
    <DetailList title="Overlay options" items={idea.overlayOptions} />
    <DetailList title="Caption options" items={idea.captionOptions} />
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl bg-green-50 p-4 text-sm text-green-950">
        <h4 className="font-semibold">Why it works</h4>
        <p className="mt-2">{idea.whyItWorks}</p>
      </div>
      <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-950">
        <h4 className="font-semibold">Why it may confuse viewers</h4>
        <p className="mt-2">{idea.whyItMayConfuseViewers}</p>
      </div>
    </div>
    <p className="text-sm font-medium text-ink-700">
      Requires extra context: {idea.requiresExtraContext ? 'Yes' : 'No'}
    </p>
  </div>
);

export const GenuineClipFinder = () => {
  const [transcript, setTranscript] = useState(sampleTranscript);
  const [context, setContext] = useState<ClipContext>({ platform: 'Instagram Reels', tone: 'clear, thoughtful, editorial' });
  const [result, setResult] = useState<ClipAnalysisResponse | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rankedIdeas = useMemo(() => result?.ideas ?? [], [result]);

  const updateContext = (key: keyof ClipContext, value: string) => {
    setContext((current) => ({ ...current, [key]: value }));
  };

  const analyze = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/clip-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, context })
      });

      if (!response.ok) throw new Error('Could not analyse the transcript.');

      const data = (await response.json()) as ClipAnalysisResponse;
      setResult(data);
      setExpandedId(data.ideas[0]?.id ?? null);
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-ink-800/10 bg-gradient-to-br from-ink-900 to-ink-700 p-8 text-white shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-white/60">Local editorial tool</p>
        <div className="mt-4 max-w-3xl space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Genuine Clip Finder</h1>
          <p className="text-lg text-white/75">
            Paste music interview transcripts, talking-to-camera scripts, release roundups, sponsored posts, or commentary and get ranked short-form clip ideas grounded in exact wording.
          </p>
        </div>
      </section>

      <form onSubmit={analyze} className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="card p-5 lg:sticky lg:top-6 lg:self-start">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="section-title">Transcript/script</h2>
              <p className="mt-1 text-sm text-ink-500">Spoken suggestions will only use text pasted here.</p>
            </div>
            <button type="submit" className="button" disabled={isLoading}>
              {isLoading ? 'Analysing…' : 'Find ideas'}
            </button>
          </div>

          <textarea
            className="input mt-4 min-h-[360px] resize-y leading-6"
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            placeholder="Paste transcript or script text here…"
          />

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <input className={fieldClass} value={context.artist ?? ''} onChange={(event) => updateContext('artist', event.target.value)} placeholder="Artist" />
            <input className={fieldClass} value={context.newRelease ?? ''} onChange={(event) => updateContext('newRelease', event.target.value)} placeholder="New release" />
            <input className={fieldClass} value={context.sponsor ?? ''} onChange={(event) => updateContext('sponsor', event.target.value)} placeholder="Sponsor" />
            <input className={fieldClass} value={context.platform ?? ''} onChange={(event) => updateContext('platform', event.target.value)} placeholder="Platform" />
          </div>
          <textarea
            className="input mt-3 min-h-[78px] resize-y"
            value={context.tone ?? ''}
            onChange={(event) => updateContext('tone', event.target.value)}
            placeholder="Tone notes"
          />
          <textarea
            className="input mt-3 min-h-[78px] resize-y"
            value={context.alreadyUsedClips ?? ''}
            onChange={(event) => updateContext('alreadyUsedClips', event.target.value)}
            placeholder="Already-used clips"
          />
        </section>

        <section className="card min-h-[620px] p-5">
          <div className="flex flex-col gap-2 border-b border-ink-800/10 pb-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="section-title">Ranked ideas</h2>
              <p className="mt-1 text-sm text-ink-500">Click an idea to expand cuts, overlays, captions, and context risks.</p>
            </div>
            <span className="tag">V1: local analysis only</span>
          </div>

          {error ? <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-900">{error}</p> : null}

          {result?.notes?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {result.notes.map((note) => (
                <span key={note} className="tag">
                  {note}
                </span>
              ))}
            </div>
          ) : null}

          {!rankedIdeas.length ? (
            <div className="mt-16 rounded-2xl border border-dashed border-ink-800/20 p-8 text-center text-ink-500">
              Run the analyser to see ranked clip ideas here.
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {rankedIdeas.map((idea, index) => {
                const isExpanded = expandedId === idea.id;
                return (
                  <article key={idea.id} className="rounded-2xl border border-ink-800/10 bg-white p-4 shadow-sm">
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => setExpandedId(isExpanded ? null : idea.id)}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">#{index + 1} · {idea.contentType}</p>
                          <h3 className="mt-1 text-xl font-semibold text-ink-900">{idea.title}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <ScorePill label="Viewer" score={idea.viewerScore} />
                          <ScorePill label="Sponsor-safe" score={idea.sponsorSafeScore} />
                        </div>
                      </div>
                    </button>
                    {isExpanded ? <IdeaDetails idea={idea} /> : null}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </form>

      <section id="rules" className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h2 className="section-title">Editorial rules</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-600">
            <li>Do not invent spoken dialogue for interview clips.</li>
            <li>Use exact transcript wording for every spoken edit suggestion.</li>
            <li>Avoid fake narratives, over-cleaned quotes, and generic TikTok phrasing.</li>
            <li>Only treat a video as Irish-focused when the context notes say so.</li>
          </ul>
        </div>
        <div id="workflow" className="card p-5">
          <h2 className="section-title">V1 workflow</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-600">
            <li>Paste source text and optional context.</li>
            <li>Review ranked ideas and expand the strongest candidates.</li>
            <li>Use overlays and captions as packaging only, not substitute quotes.</li>
            <li>Future analytics, platform logging, and trend comparison are isolated in typed adapters.</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
