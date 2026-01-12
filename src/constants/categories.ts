// Category icons mapped by slug
export const CATEGORY_ICONS: Record<string, string> = {
  nasional: '🇲🇾',      // தேசியம்
  politik: '🏛️',       // அரசியல்
  ekonomi: '📈',        // பொருளாதாரம்
  sukan: '⚽',          // விளையாட்டு
  hiburan: '🎬',        // பொழுதுபோக்கு
  antarabangsa: '🌍',   // உலகம்
  teknologi: '💻',      // தொழில்நுட்பம்
  jenayah: '🚔',        // குற்றம்
  kesihatan: '🏥',      // சுகாதாரம்
  pendidikan: '📚',     // கல்வி
  agama: '🕌',          // மதம்
  gaya: '👗',           // வாழ்க்கை முறை
  automotif: '🚗',      // வாகனம்
  hartanah: '🏠',       // சொத்து
  makanan: '🍜',        // உணவு
} as const;

export const getCategoryIcon = (slug: string): string => {
  return CATEGORY_ICONS[slug] || '📰';
};
