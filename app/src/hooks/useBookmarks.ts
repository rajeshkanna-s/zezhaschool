import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface BookmarkInput {
  item_type: 'course' | 'page' | 'mission';
  item_id: string;
  title: string;
  link: string;
  icon?: string;
}

/** Tracks the current user's bookmarked item ids and toggles them. */
export function useBookmarks() {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from('bookmarks').select('item_id').eq('user_id', user.id);
    if (data) setIds(new Set(data.map(b => b.item_id)));
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const isBookmarked = useCallback((itemId: string) => ids.has(itemId), [ids]);

  const toggle = useCallback(async (b: BookmarkInput) => {
    if (!user) return;
    const has = ids.has(b.item_id);
    // optimistic update
    setIds(prev => {
      const next = new Set(prev);
      if (has) next.delete(b.item_id); else next.add(b.item_id);
      return next;
    });
    if (has) {
      await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('item_id', b.item_id);
    } else {
      await supabase.from('bookmarks').insert({
        user_id: user.id, item_type: b.item_type, item_id: b.item_id,
        title: b.title, link: b.link, icon: b.icon ?? '🔖',
      });
    }
  }, [user, ids]);

  return { isBookmarked, toggle, loading, count: ids.size };
}
