import Image from 'next/image';

export type ListItem = {
  id: string;
  note: string | null;
  sort_order: number | null;
  music_items:
    | {
        title: string;
        artist: string;
        year: number | null;
        image_url: string | null;
      }
    | {
        title: string;
        artist: string;
        year: number | null;
        image_url: string | null;
      }[]
    | null;
};

export const ListGrid = ({ items }: { items: ListItem[] }) => {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map((item) => {
        const musicItem = Array.isArray(item.music_items) ? item.music_items[0] : item.music_items;

        return (
        <div key={item.id} className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-ink-800/10">
            {musicItem?.image_url ? (
              <Image
                src={musicItem.image_url}
                alt={musicItem.title}
                fill
                className="object-cover"
              />
            ) : null}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900">
              {musicItem?.title}
            </p>
            <p className="text-xs text-ink-500">
              {musicItem?.artist}
              {musicItem?.year ? ` · ${musicItem.year}` : ''}
            </p>
          </div>
          {item.note ? <p className="text-xs text-ink-600">{item.note}</p> : null}
        </div>
        );
      })}
    </div>
  );
};
