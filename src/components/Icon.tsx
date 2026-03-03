import React from "react";

export function Icon({ name, size = 16 }: { name: string; size?: number }) {
  return (
    <svg width={size} height={size} aria-hidden="true">
      {/* для iOS/Safari можно подстраховать xlinkHref */}
      <use href={`#${name}`} xlinkHref={`#${name}`} />
    </svg>
  );
}