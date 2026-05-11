"use client";

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="48" height="48" rx="12" fill="url(#logo-bg)" />

      {/* Left V bars - descending */}
      <rect x="8" y="10" width="5" height="12" rx="2" fill="white" opacity="0.55" />
      <rect x="14.5" y="15" width="5" height="14" rx="2" fill="white" opacity="0.75" />
      <rect x="21" y="20" width="5" height="18" rx="2" fill="white" opacity="0.95" />

      {/* Right V bars - ascending */}
      <rect x="27.5" y="20" width="5" height="18" rx="2" fill="white" opacity="0.95" />
      <rect x="34" y="15" width="5" height="14" rx="2" fill="white" opacity="0.75" />
      <rect x="40.5" y="10" width="5" height="12" rx="2" fill="white" opacity="0.55" />
    </svg>
  );
}

export function LogoFull({ size = 36 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <Logo size={size} />
      <div>
        <h1 className="text-lg font-bold text-white tracking-tight">Veloxis</h1>
        <p className="text-[10px] text-muted tracking-widest uppercase">Marketing Intelligence</p>
      </div>
    </div>
  );
}
