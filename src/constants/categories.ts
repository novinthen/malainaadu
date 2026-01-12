export const CATEGORY_ICONS: Record<string, string> = {
  politik: '🏛️',
  sukan: '⚽',
  hiburan: '🎬',
  ekonomi: '📈',
  jenayah: '🚔',
  nasional: '🇲🇾',
  antarabangsa: '🌍',
  teknologi: '💻',
  kesihatan: '🏥',
  pendidikan: '📚',
  agama: '🕌',
  gaya: '👗',
  automotif: '🚗',
  hartanah: '🏠',
  makanan: '🍜',
} as const;

export const getCategoryIcon = (slug: string): string => {
  return CATEGORY_ICONS[slug] || '📰';
};
