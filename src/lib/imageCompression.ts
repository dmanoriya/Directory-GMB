export interface CompressionOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  width?: number;
  height?: number;
}

export function validateImageFile(file: File): ValidationResult {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'Invalid file format. Please upload a JPG, PNG, or WebP image.',
    };
  }

  // Max 10MB initial size check
  if (file.size > 10 * 1024 * 1024) {
    return {
      valid: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum 10MB limit.`,
    };
  }

  return { valid: true };
}

export async function compressAndResizeImage(
  file: File,
  options: CompressionOptions = { maxWidth: 1200, maxHeight: 800, quality: 0.85 }
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio scaling
        if (width > options.maxWidth) {
          height = Math.round((height * options.maxWidth) / width);
          width = options.maxWidth;
        }

        if (height > options.maxHeight) {
          width = Math.round((width * options.maxHeight) / height);
          height = options.maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        // Draw image onto canvas with high quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const extension = file.name.substring(file.name.lastIndexOf('.'));
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^.]+$/, `_compressed.jpg`),
              { type: 'image/jpeg', lastModified: Date.now() }
            );
            resolve(compressedFile);
          },
          'image/jpeg',
          options.quality
        );
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
}
