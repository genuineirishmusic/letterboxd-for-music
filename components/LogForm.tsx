'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DEFAULT_CONTEXT_TAGS, VISIBILITY_OPTIONS } from '@/lib/constants';

export const LogForm = ({ musicItemId }: { musicItemId: string }) => {
  const supabase = createClient();
  const [rating, setRating] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [listenedAt, setListenedAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [visibility, setVisibility] = useState('public');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    const normalized = customTag.trim().toLowerCase();
    if (!normalized) return;
    setSelectedTags((prev) => Array.from(new Set([...prev, normalized])));
    setCustomTag('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setStatus('Please sign in to log a listen.');
      return;
    }

    const { data: log, error } = await supabase
      .from('logs')
      .insert({
        user_id: userData.user.id,
        music_item_id: musicItemId,
        listened_at: new Date(listenedAt).toISOString(),
        rating: rating ? Number(rating) : null,
        review_text: reviewText || null,
        visibility
      })
      .select('id')
      .single();

    if (error || !log) {
      setStatus('Could not save your log yet. Try again.');
      return;
    }

    if (selectedTags.length) {
      const tagRows = selectedTags.map((tag) => ({ log_id: log.id, tag }));
      const { error: tagError } = await supabase.from('log_tags').insert(tagRows);
      if (tagError) {
        setStatus('Saved log, but tags failed to save.');
        return;
      }
    }

    setStatus('Saved to your listening diary.');
    setRating('');
    setReviewText('');
    setSelectedTags([]);
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-5">
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="flex-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            listened at
          </label>
          <input
            type="datetime-local"
            value={listenedAt}
            onChange={(event) => setListenedAt(event.target.value)}
            className="input"
          />
        </div>
        <div className="w-full md:w-40">
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            rating (optional)
          </label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.5"
            value={rating}
            onChange={(event) => setRating(event.target.value)}
            className="input"
            placeholder="4.5"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">
          moment notes
        </label>
        <textarea
          value={reviewText}
          onChange={(event) => setReviewText(event.target.value)}
          className="input min-h-[110px]"
          placeholder="What did this album hold for you?"
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">
          context tags
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {DEFAULT_CONTEXT_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`tag ${selectedTags.includes(tag) ? 'bg-ink-900 text-white' : ''}`}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={customTag}
            onChange={(event) => setCustomTag(event.target.value)}
            placeholder="Add custom tag"
            className="input"
          />
          <button type="button" onClick={addCustomTag} className="button-secondary">
            Add
          </button>
        </div>
        {selectedTags.length ? (
          <p className="mt-2 text-xs text-ink-500">
            {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''} selected.
          </p>
        ) : null}
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">
          visibility
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {VISIBILITY_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setVisibility(option)}
              className={`tag ${visibility === option ? 'bg-ink-900 text-white' : ''}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      {status ? <p className="text-sm text-ink-600">{status}</p> : null}
      <button type="submit" className="button w-full">
        Log this listen
      </button>
    </form>
  );
};
