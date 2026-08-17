const API_BASE = import.meta.env.VITE_API_BASE || '';

/**
 * Returns a proper URL for images (works seamlessly with Cloudinary HTTPS URLs or local backend paths).
 *
 * @param path The photoPath or imagePath stored in the database.
 * @param fallback Default fallback image URL/avatar.
 */
export function getImageUrl(
  path?: string | null,
  fallback = 'https://ui-avatars.com/api/?name=Pet&size=512&background=60a5fa&color=fff'
): string {
  if (!path || path.trim() === '') {
    return fallback;
  }

  // Already a full Cloudinary / external HTTPS URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Normalize relative paths
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;

  if (cleanPath.startsWith('uploads/')) {
    return `${API_BASE}/${cleanPath}`;
  }

  return `${API_BASE}/uploads/${cleanPath}`;
}
