import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const POST = async (request: Request) => {
  const payload = await request.json();
  const { source, source_id, title, artist, year, image_url } = payload ?? {};

  if (!source || !source_id || !title) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('music_items')
    .upsert(
      {
        source,
        source_id,
        type: 'album',
        title,
        artist,
        year,
        image_url
      },
      { onConflict: 'source,source_id' }
    )
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ id: data.id });
};
