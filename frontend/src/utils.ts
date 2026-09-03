import type { Requester } from './types';

const STORAGE_KEY = 'toctickit_requester';

export function getStoredRequester(): Requester | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Requester) : null;
  } catch {
    return null;
  }
}

export function storeRequester(requester: Requester): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(requester));
}

export function clearRequester(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

/** Generate a pastel avatar background color from a string (name) */
const AVATAR_COLORS = [
  '#2D6A4F', '#1B4332', '#40916C', '#74C69D',
  '#1D3557', '#457B9D', '#6D4C41', '#5C6BC0',
];
export function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/** Get initials from a full name */
export function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Format bytes to human-readable size */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Format ISO date string to readable date */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Format ISO date string with time */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Attachment Validation ────────────────────────────────────────────────────

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_ATTACHMENTS = 5;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateAttachment(
  file: { type: string; size: number },
  currentCount: number
): ValidationResult {
  if (currentCount >= MAX_ATTACHMENTS) {
    return { valid: false, error: 'Maximum 5 attachments allowed' };
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    return { valid: false, error: 'Unsupported file type. Allowed: JPG, PNG, WEBP, PDF' };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { valid: false, error: 'File size exceeds the 5 MB limit' };
  }
  return { valid: true };
}
