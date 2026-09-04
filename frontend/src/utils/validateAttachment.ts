export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export function validateAttachment(file: { type: string; size: number }, currentCount: number): ValidationResult {
  if (currentCount >= 5) {
    return { valid: false, error: 'Maximum 5 attachments allowed' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Unsupported file type' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File exceeds 5 MB limit' };
  }

  return { valid: true };
}
