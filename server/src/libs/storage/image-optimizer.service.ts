/**
 * Image Optimization Service
 *
 * Uses Jimp so image uploads also work on older x86-64 production CPUs.
 * Uploaded avatars are decoded, bounded, resized and re-encoded as PNG. The
 * re-encode drops EXIF and other source metadata.
 */

import { Jimp, JimpMime } from 'jimp';
import { FILE_UPLOAD_CONSTANTS } from './file-validator.js';
import { ValidationError, InternalError } from '@shared/errors/errors.js';
import { logger } from '@libs/logger.js';

const MAX_INPUT_PIXELS = 25_000_000;

type SupportedImageFormat = 'jpeg' | 'png';

interface ImageHeader {
  format: SupportedImageFormat;
  width: number;
  height: number;
}

function assertSafeDimensions(format: SupportedImageFormat, width: number, height: number): ImageHeader {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width <= 0 || height <= 0) {
    throw new ValidationError('Unable to read image dimensions', 'INVALID_IMAGE');
  }

  if (width * height > MAX_INPUT_PIXELS) {
    throw new ValidationError('Image dimensions are too large', 'IMAGE_DIMENSIONS_TOO_LARGE');
  }

  return { format, width, height };
}

function readPngHeader(buffer: Buffer): ImageHeader | null {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.length < 24 || !buffer.subarray(0, signature.length).equals(signature)) {
    return null;
  }

  if (buffer.toString('ascii', 12, 16) !== 'IHDR') {
    throw new ValidationError('Invalid PNG image', 'INVALID_IMAGE');
  }

  return assertSafeDimensions('png', buffer.readUInt32BE(16), buffer.readUInt32BE(20));
}

function readJpegHeader(buffer: Buffer): ImageHeader | null {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return null;
  }

  const startOfFrameMarkers = new Set([
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
  ]);
  let offset = 2;

  while (offset + 3 < buffer.length) {
    while (offset < buffer.length && buffer[offset] === 0xff) offset += 1;
    if (offset >= buffer.length) break;

    const marker = buffer[offset];
    offset += 1;

    if (marker === 0x00 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
      continue;
    }

    if (offset + 1 >= buffer.length) break;
    const segmentLength = buffer.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > buffer.length) break;

    if (startOfFrameMarkers.has(marker)) {
      if (segmentLength < 7) break;
      return assertSafeDimensions(
        'jpeg',
        buffer.readUInt16BE(offset + 5),
        buffer.readUInt16BE(offset + 3)
      );
    }

    offset += segmentLength;
  }

  throw new ValidationError('Invalid JPEG image', 'INVALID_IMAGE');
}

function inspectImageHeader(buffer: Buffer): ImageHeader {
  const header = readPngHeader(buffer) ?? readJpegHeader(buffer);
  if (!header) {
    throw new ValidationError('Image format is not supported', 'UNSUPPORTED_IMAGE_FORMAT');
  }
  return header;
}

class ImageOptimizerService {
  async optimizeAvatar(buffer: Buffer): Promise<Buffer> {
    try {
      const metadata = inspectImageHeader(buffer);
      const image = await Jimp.read(buffer);

      logger.info({
        msg: 'Optimizing avatar image',
        originalFormat: metadata.format,
        originalSize: buffer.length,
        originalDimensions: `${metadata.width}x${metadata.height}`,
      });

      if (
        image.width > FILE_UPLOAD_CONSTANTS.AVATAR_MAX_DIMENSION
        || image.height > FILE_UPLOAD_CONSTANTS.AVATAR_MAX_DIMENSION
      ) {
        image.scaleToFit({
          w: FILE_UPLOAD_CONSTANTS.AVATAR_MAX_DIMENSION,
          h: FILE_UPLOAD_CONSTANTS.AVATAR_MAX_DIMENSION,
        });
      }

      const optimized = await image.getBuffer(JimpMime.png, {
        deflateLevel: 9,
        deflateStrategy: 3,
      });

      logger.info({
        msg: 'Avatar optimization complete',
        optimizedSize: optimized.length,
        compressionRatio: `${((1 - optimized.length / buffer.length) * 100).toFixed(1)}%`,
      });

      return optimized;
    } catch (error) {
      if (error instanceof ValidationError) throw error;

      if (error instanceof Error && /unsupported|unrecognised|invalid|decode/i.test(error.message)) {
        throw new ValidationError('Invalid or unsupported image data', 'INVALID_IMAGE');
      }

      logger.error({ err: error, msg: 'Image optimization failed' });
      throw new InternalError('Failed to optimize image', 'IMAGE_OPTIMIZATION_FAILED');
    }
  }

  async validateImageBuffer(buffer: Buffer): Promise<boolean> {
    try {
      inspectImageHeader(buffer);
      await Jimp.read(buffer);
      return true;
    } catch (error) {
      if (error instanceof ValidationError) throw error;

      logger.error({ err: error, msg: 'Image validation failed' });
      throw new ValidationError('Unable to validate image', 'INVALID_IMAGE');
    }
  }
}

export const imageOptimizerService = new ImageOptimizerService();
