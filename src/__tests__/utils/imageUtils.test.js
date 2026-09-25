import { describe, it, expect } from 'vitest';
import { compressImage } from '../../utils/imageUtils';

describe('compressImage', () => {
    it('returns non-image files untouched', async () => {
        const pdf = new File(['%PDF'], 'proof.pdf', { type: 'application/pdf' });
        await expect(compressImage(pdf)).resolves.toBe(pdf);
    });

    it('returns small images untouched', async () => {
        const small = new File([new Uint8Array(1024)], 'tiny.jpg', { type: 'image/jpeg' });
        await expect(compressImage(small)).resolves.toBe(small);
    });
});
