export const PATH_COLORS = {
  ausbildung:   { text: '#1D4ED8', bg: '#EFF6FF', border: '#3B82F6' },
  studium:      { text: '#6D28D9', bg: '#F5F3FF', border: '#8B5CF6' },
  fsj:          { text: '#0F766E', bg: '#F0FDFA', border: '#14B8A6' },
  freelancing:  { text: '#B45309', bg: '#FFFBEB', border: '#F59E0B' },
bundeswehr:   { text: '#374151', bg: '#F3F4F6', border: '#6B7280' },
  'gap-year':   { text: '#C2410C', bg: '#FFF7ED', border: '#FB923C' },
};

export function pathColor(id) {
  return PATH_COLORS[id] || { text: '#1a1a1a', bg: '#f4f4f2', border: '#9c9a92' };
}
