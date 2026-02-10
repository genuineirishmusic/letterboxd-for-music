'use client';

import { useMemo, useState } from 'react';
import { FeedFilters } from '@/components/FeedFilters';
import { FeedCard } from '@/components/FeedCard';

export type FeedLog = React.ComponentProps<typeof FeedCard>['log'];

export const FeedSection = ({ logs }: { logs: FeedLog[] }) => {
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    if (filter === 'reviews') {
      return logs.filter((log) => log.review_text && log.review_text.trim().length > 0);
    }
    if (filter === 'private') {
      return logs.filter((log) => log.visibility === 'private');
    }
    return logs;
  }, [filter, logs]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-ink-900">Your listening feed</h1>
        <FeedFilters active={filter} onChange={setFilter} />
      </div>
      <div className="space-y-4">
        {filtered.length ? (
          filtered.map((log) => <FeedCard key={log.id} log={log} />)
        ) : (
          <div className="card p-6 text-sm text-ink-500">
            No logs yet. Follow people or log your first moment.
          </div>
        )}
      </div>
    </section>
  );
};
