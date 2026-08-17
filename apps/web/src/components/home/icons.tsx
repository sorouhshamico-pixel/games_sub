export function BoltIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  );
}

export function ShieldIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinejoin="round" d="M12 3 4.5 6v6c0 4.5 3 7.5 7.5 9 4.5-1.5 7.5-4.5 7.5-9V6L12 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function HeadsetIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <rect x="3" y="13" width="4" height="6" rx="1.5" />
      <rect x="17" y="13" width="4" height="6" rx="1.5" />
      <path strokeLinecap="round" d="M19 19v.5a3 3 0 0 1-3 3h-2.5" />
    </svg>
  );
}

export function GamepadIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2.5" y="7" width="19" height="11" rx="5.5" />
      <path strokeLinecap="round" d="M7 10.5v3M5.5 12h3" />
      <circle cx="16" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="13" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function GiftIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="8.5" width="18" height="4" rx="1" />
      <path strokeLinecap="round" d="M5 12.5v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7M12 8.5v11.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.5c0-2.5-1.5-4-3.2-4S6 5.8 6 7.2C6 8.5 7.3 8.5 8 8.5h4Zm0 0c0-2.5 1.5-4 3.2-4S18 5.8 18 7.2c0 1.3-1.3 1.3-2 1.3h-4Z" />
    </svg>
  );
}

export function WalletIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2M3 8v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-4a2 2 0 1 0 0 4" />
    </svg>
  );
}

export function RefreshIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 11a8 8 0 0 0-14.6-4.4M4 4v4h4M4 13a8 8 0 0 0 14.6 4.4M20 20v-4h-4" />
    </svg>
  );
}

export const categoryIconCycle = [GamepadIcon, GiftIcon, WalletIcon, RefreshIcon];

export function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.1 8.1 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8.9-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5.1-.1.2-.3.4-.4.1-.1.2-.2.2-.4.1-.1 0-.3 0-.4 0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2 1 2.4c.1.2 1.6 2.5 4 3.5.6.2 1 .4 1.3.5.6.2 1.1.2 1.5.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1 .1-1.2-.1-.1-.2-.2-.4-.3Z" />
    </svg>
  );
}

export function StarIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="m12 2 2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8-5.1-4.7 6.9-.8L12 2Z" />
    </svg>
  );
}

export function AppleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M16.5 2c.1 1.1-.3 2.2-1 3-.7.8-1.8 1.4-2.9 1.3-.1-1.1.4-2.2 1-2.9.8-.9 2-1.4 2.9-1.4ZM20 17.2c-.5 1.1-.8 1.6-1.4 2.6-.9 1.4-2.2 3.1-3.8 3.1-1.4 0-1.7-.9-3.6-.9s-2.3.9-3.6.9c-1.6 0-2.8-1.6-3.7-3-2.5-3.9-2.8-8.5-1.2-10.9 1.1-1.7 2.9-2.7 4.5-2.7 1.7 0 2.7 1 4.1 1 1.3 0 2.1-1 4.1-1 1.5 0 3 .8 4.1 2.2-3.6 2-3 7.2 1.5 8.7Z" />
    </svg>
  );
}

export function PlayStoreIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="m3.6 2.6 10.4 10.4-3 3-8-11.8c.1-.6.4-1.2.6-1.6ZM3 4.2l8.3 8.3L3 20.8a2 2 0 0 1-.4-1.2V5.2c0-.4.1-.7.4-1ZM14 14l3 3-9 4.9c-.4.2-.9.3-1.4.2L14 14Zm0-4 3-3 3.2 1.8c1 .6 1 2 0 2.6L17 13.2 14 10Z" />
    </svg>
  );
}
