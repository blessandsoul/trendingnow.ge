import { describe, expect, it } from 'vitest';
import { Jimp, JimpMime } from 'jimp';
import { imageOptimizerService } from './image-optimizer.service.js';
import { ValidationError } from '@shared/errors/errors.js';

describe('imageOptimizerService', () => {
  it('resizes a large avatar and re-encodes it as PNG', async () => {
    const source = new Jimp({ width: 1024, height: 256, color: 0xff3366ff });
    const input = await source.getBuffer(JimpMime.jpeg, { quality: 90 });

    const optimized = await imageOptimizerService.optimizeAvatar(input);
    const decoded = await Jimp.read(optimized);

    expect(optimized.subarray(0, 8)).toEqual(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    );
    expect(decoded.width).toBe(512);
    expect(decoded.height).toBe(128);
  });

  it('rejects data that only pretends to be an image', async () => {
    await expect(imageOptimizerService.optimizeAvatar(Buffer.from('not-an-image'))).rejects.toMatchObject({
      code: 'UNSUPPORTED_IMAGE_FORMAT',
    });
  });

  it('rejects oversized pixel dimensions before decoding', async () => {
    const header = Buffer.alloc(24);
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(header, 0);
    header.write('IHDR', 12, 'ascii');
    header.writeUInt32BE(10_000, 16);
    header.writeUInt32BE(10_000, 20);

    await expect(imageOptimizerService.optimizeAvatar(header)).rejects.toBeInstanceOf(ValidationError);
    await expect(imageOptimizerService.optimizeAvatar(header)).rejects.toMatchObject({
      code: 'IMAGE_DIMENSIONS_TOO_LARGE',
    });
  });
});
