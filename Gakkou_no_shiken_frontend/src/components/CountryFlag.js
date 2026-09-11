'use client';

import React, { useState } from 'react';
import { getCountryCode, getCountryFlag } from '@/lib/utils';

/**
 * Universal Country Flag Component
 * Displays high-resolution visual national flags across all operating systems
 * (especially Windows which lacks native emoji flag rendering).
 */
export default function CountryFlag({
  country,
  flagEmoji,
  width = 20,
  height = 14,
  className = '',
  imgClassName = '',
  showLabel = false,
  labelClassName = '',
}) {
  const [hasError, setHasError] = useState(false);
  const code = getCountryCode(country);
  const fallbackEmoji = flagEmoji || getCountryFlag(country);

  const isGlobal = !code || country === 'Global';

  return (
    <span className={`inline-flex items-center gap-1.5 align-middle ${className}`}>
      {code && !hasError && !isGlobal ? (
        <img
          src={`https://flagcdn.com/w40/${code}.png`}
          srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
          alt={country ? `${country} flag` : 'Country flag'}
          width={width}
          height={height}
          loading="lazy"
          className={`rounded-[2px] object-cover shadow-2xs border border-black/15 shrink-0 inline-block align-middle ${imgClassName}`}
          style={{ width: `${width}px`, height: `${height}px`, minWidth: `${width}px` }}
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="text-sm leading-none shrink-0" role="img" aria-label={country || 'flag'}>
          {fallbackEmoji || '🌐'}
        </span>
      )}
      {showLabel && country && (
        <span className={labelClassName || 'truncate'}>{country}</span>
      )}
    </span>
  );
}
