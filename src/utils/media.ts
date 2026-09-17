/**
 * Resolves a media URL (image, avatar, banner, document) to a full accessible URL.
 * Handles absolute URLs (http://, https://), base64 data URIs (data:image/...),
 * and relative server paths (/media/uploads/...).
 * Also automatically normalizes Google Drive links so they can be rendered as direct images.
 */
export const getMediaUrl = (url?: string | null): string => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Transform Google Drive links to direct view/thumbnail link
  if (trimmed.includes('drive.google.com')) {
    const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
    }
    const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${idParamMatch[1]}`;
    }
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
  const serverBase = apiBase.replace(/\/api\/?$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  return `${serverBase}${cleanPath}`;
};

/**
 * Built-in elegant, dark-theme SVG fallback poster.
 * Never expires, renders completely offline, zero broken image boxes.
 */
export const FALLBACK_EVENT_POSTER = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500" fill="none">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b0f19" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
    <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#6366f1" stop-opacity="0.05" />
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bgGrad)"/>
  <circle cx="400" cy="220" r="160" fill="url(#circleGrad)"/>
  <circle cx="400" cy="220" r="110" fill="#0284c7" fill-opacity="0.1"/>
  <g transform="translate(360, 180)" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <rect x="4" y="8" width="72" height="64" rx="10" stroke="#38bdf8" />
    <line x1="24" y1="2" x2="24" y2="14" />
    <line x1="56" y1="2" x2="56" y2="14" />
    <line x1="4" y1="28" x2="76" y2="28" />
    <circle cx="28" cy="46" r="3" fill="#38bdf8" />
    <circle cx="40" cy="46" r="3" fill="#38bdf8" />
    <circle cx="52" cy="46" r="3" fill="#38bdf8" />
  </g>
  <text x="400" y="300" text-anchor="middle" fill="#f8fafc" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" letter-spacing="1">CLUB EVENT</text>
  <text x="400" y="328" text-anchor="middle" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="500">Official Club Hub Poster</text>
</svg>
`)}`;

/**
 * Image onError handler to cleanly replace broken/expired images with fallback poster.
 */
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.currentTarget;
  if (target.src !== FALLBACK_EVENT_POSTER) {
    target.src = FALLBACK_EVENT_POSTER;
  }
};
