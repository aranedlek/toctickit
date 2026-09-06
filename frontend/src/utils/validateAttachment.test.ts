import { describe, it, expect } from 'vitest';
import { validateAttachment } from './validateAttachment';

describe('validateAttachment', () => {
  it('UT-01: Accepts valid PDF under 5MB', () => {
    const file = { type: 'application/pdf', size: 4 * 1024 * 1024 };
    const result = validateAttachment(file, 0);
    expect(result).toEqual({ valid: true });
  });

  it('UT-05: Rejects unsupported file types', () => {
    const file = { type: 'text/plain', size: 1000 };
    const result = validateAttachment(file, 0);
    expect(result).toEqual({ valid: false, error: 'Unsupported file type' });
  });

  it('UT-06: Rejects file > 5 MB', () => {
    const file = { type: 'image/jpeg', size: 6 * 1024 * 1024 };
    const result = validateAttachment(file, 0);
    expect(result).toEqual({ valid: false, error: 'File exceeds 5 MB limit' });
  });

  it('UT-07: Rejects 6th attachment', () => {
    const file = { type: 'image/jpeg', size: 1000 };
    const result = validateAttachment(file, 5);
    expect(result).toEqual({ valid: false, error: 'Maximum 5 attachments allowed' });
  });
});
