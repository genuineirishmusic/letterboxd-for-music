import Image from 'next/image';

export type ListItem = {
  id: string;
  note: string | null;
  sort_order: number | null;
  music_items: {
    title: string;
    artist: string;
    year: number | null;
    image_url: string | null;
  } | null;
};

export const ListGrid = ({ items }: { items: ListItem[] }) => {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map((item) => (
        <div key={item.id} className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-ink-800/10">
            {item.music_items?.image_url ? (
              <Image
                src={item.music_items.image_url}
                alt={item.music_items.title}
                fill
                className="object-cover"
              />
            ) : null}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900">
              {item.music_items?.title}
            </p>
            <p className="text-xs text-ink-500">
              {item.music_items?.artist}
              {item.music_items?.year ? ` · ${item.music_items.year}` : ''}
            </p>
          </div>
          {item.note ? <p className="text-xs text-ink-600">{item.note}</p> : null}
        </div>
      ))}
    </div>
  );
};
