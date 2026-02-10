'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export const FollowButton = ({ targetUserId }: { targetUserId: string }) => {
  const supabase = createClient();
  const [isFollowing, setIsFollowing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', userData.user.id)
        .eq('following_id', targetUserId)
        .maybeSingle();

      setIsFollowing(!!data);
    };

    load();
  }, [supabase, targetUserId]);

  const toggleFollow = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    setStatus('loading');
    if (isFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', userData.user.id)
        .eq('following_id', targetUserId);
      setIsFollowing(false);
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: userData.user.id, following_id: targetUserId });
      setIsFollowing(true);
    }
    setStatus('idle');
  };

  return (
    <button
      type="button"
      onClick={toggleFollow}
      className={isFollowing ? 'button-ghost' : 'button-secondary'}
      disabled={status === 'loading'}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
};
