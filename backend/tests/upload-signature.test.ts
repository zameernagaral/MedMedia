import { describe, expect, it } from '@jest/globals';
import { detectMediaMimeType } from '../src/routes/upload';

describe('media signature validation', () => {
  it('recognizes supported image signatures', () => {
    expect(detectMediaMimeType(Buffer.from([0xff, 0xd8, 0xff, 0x00]))).toBe('image/jpeg');
    expect(detectMediaMimeType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe('image/png');
    expect(detectMediaMimeType(Buffer.from('GIF89a'))).toBe('image/gif');
    expect(detectMediaMimeType(Buffer.from('RIFF0000WEBP'))).toBe('image/webp');
  });

  it('recognizes MP4 and QuickTime containers and rejects unknown content', () => {
    expect(detectMediaMimeType(Buffer.from('0000ftypisom'))).toBe('video/mp4');
    expect(detectMediaMimeType(Buffer.from('0000ftypqt  '))).toBe('video/quicktime');
    expect(detectMediaMimeType(Buffer.from('not a media file'))).toBeNull();
  });
});
