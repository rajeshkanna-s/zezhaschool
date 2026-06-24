export interface RecentItem {
  type: 'course' | 'page' | 'mission';
  title: string;
  to: string;
  icon: string;
}

const KEY = 'recent-items';

export function getRecent(): RecentItem[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function recordRecent(item: RecentItem) {
  const list = getRecent().filter(i => i.to !== item.to);
  list.unshift(item);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 8)));
}
