'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { getCategoryFallbackImage } from '@/lib/categoryFallbacks';

interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src?: string | null;
  fallbackSrc?: string;
  variant?: 'grid' | 'detail';
  /** Business category / type for category-specific fallback images */
  category?: string | null;
}

export default function SafeImage({
  src,
  fallbackSrc,
  variant = 'grid',
  category,
  alt,
  ...props
}: SafeImageProps) {
  // Priority: explicit fallbackSrc > category-based > generic env var
  const defaultFallback =
    fallbackSrc || getCategoryFallbackImage(category, variant);

  const [imgSrc, setImgSrc] = useState<string>(
    src && src.trim() !== '' ? src : defaultFallback
  );
  const [hasError, setHasError] = useState<boolean>(false);

  return (
    <Image
      {...props}
      src={hasError ? defaultFallback : imgSrc}
      alt={alt || 'Business listing image'}
      unoptimized
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(defaultFallback);
        }
      }}
    />
  );
}
