export function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconProducts({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" strokeLinejoin="round" />
      <path d="M3.3 7.7L12 12.5l8.7-4.8M12 22.3V12.5" />
    </svg>
  );
}

export function IconFinance({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 9h4M7 13h10" strokeLinecap="round" />
    </svg>
  );
}

export function IconProfile({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" strokeLinecap="round" />
    </svg>
  );
}

export function IconInsights({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" strokeLinecap="round" />
      <circle cx="12" cy="12" r="4" />
      <path d="M7 7l2 2M15 15l2 2M17 7l-2 2M9 15l-2 2" strokeLinecap="round" />
    </svg>
  );
}
