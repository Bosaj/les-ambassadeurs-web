/**
 * Compresses an image file using Canvas before upload.
 * This dramatically reduces upload time on slow connections.
 *
 * @param {File} file - The original image file
 * @param {object} options
 * @param {number} options.maxWidth  - Max width in px (default 1200)
 * @param {number} options.maxHeight - Max height in px (default 1200)
 * @param {number} options.quality   - JPEG quality 0-1 (default 0.8)
 * @returns {Promise<File>} - Compressed File object
 */
export const compressImage = (file, { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = {}) => {
    return new Promise((resolve) => {
        // If it's not an image or is already tiny, skip compression
        if (!file.type.startsWith('image/') || file.size < 200 * 1024) {
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let { width, height } = img;

                // Scale down proportionally
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) { resolve(file); return; }
                        // Keep original filename & type metadata
                        const compressed = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
                        console.log(`[imageUtils] Compressed ${file.name}: ${(file.size / 1024).toFixed(0)}KB → ${(compressed.size / 1024).toFixed(0)}KB`);
                        resolve(compressed);
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
};
