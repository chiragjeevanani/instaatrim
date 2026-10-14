import React, { useState } from 'react';

// <img> that degrades to a soft branded tile with the item's initial when the
// source is missing or fails to load, instead of the browser's broken-image
// icon and alt text spilling over the card.
export const SafeImage = ({ src, alt = '', className = '', fallbackClassName = '', ...rest }) => {
  const [failedSrc, setFailedSrc] = useState(null);

  if (!src || failedSrc === src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`${className} flex items-center justify-center bg-gradient-to-br from-[#eaddf3] via-[#f3ebf8] to-rose-100 text-brand-maroon/70 font-serif font-bold select-none ${fallbackClassName}`}
      >
        <span className="text-[1.6em] leading-none">{alt?.trim()?.charAt(0)?.toUpperCase() || '✦'}</span>
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} onError={() => setFailedSrc(src)} {...rest} />;
};
