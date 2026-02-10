import { createClient } from '@/lib/supabase/server';
import { ListGrid } from '@/components/ListGrid';

export default async function ListPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: list } = await supabase
    .from('lists')
    .select(
      `
      id,
      title,
      description,
      visibility,
      list_items ( id, note, sort_order, music_items ( title, artist, year, image_url ) )
    `
    )
    .eq('id', params.id)
    .single();

  const items = list?.list_items ?? [];

  return (
    <div className="space-y-8">
      <section className="card space-y-4 p-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-500">List</p>
          <h1 className="text-3xl font-semibold text-ink-900">{list?.title}</h1>
          <p className="text-sm text-ink-600">{list?.description}</p>
        </div>
        <p className="text-xs text-ink-400">{list?.visibility ?? 'public'} list</p>
      </section>
      <section className="card p-6">
        <ListGrid items={items} />
      </section>
      <section className="border-t border-ink-800/10 pt-8">
        <div className="rounded-2xl border border-dashed border-ink-800/20 px-4 py-6 text-sm text-ink-400">
          Reserved for future editorial or sponsorship content.
        </div>
      </section>
    </div>
  );
}
