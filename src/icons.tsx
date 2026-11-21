import type { SVGProps } from "react";

const base = (p: SVGProps<SVGSVGElement>) => ({
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true,
  ...p,
});

export const UsersIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM9 13c-3.3 0-7 1.7-7 4v2h14v-2c0-2.3-3.7-4-7-4Zm8 0c-.5 0-1 0-1.5.1 1.5 1 2.5 2.4 2.5 3.9v2h4v-2c0-2-2.8-4-5-4Z" />
  </svg>
);

export const ClockIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5v4.6l3.2 3.2-1.4 1.4L11 12.4V7h2Z" />
  </svg>
);

export const CpuIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path fillRule="evenodd" d="M9 2h2v3h2V2h2v3h1a2 2 0 0 1 2 2v1h3v2h-3v2h3v2h-3v1a2 2 0 0 1-2 2h-1v3h-2v-3h-2v3H9v-3H8a2 2 0 0 1-2-2v-1H3v-2h3v-2H3V8h3V7a2 2 0 0 1 2-2h1V2Zm-1 5v10h8V7H8Z" />
  </svg>
);

export const MemoryIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path fillRule="evenodd" d="M3 7h18a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-1v2h-2v-2h-2v2h-2v-2h-2v2H9v-2H7v2H5v-2H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Zm2 3v4h3v-4H5Zm5 0v4h3v-4h-3Zm5 0v4h3v-4h-3Z" />
  </svg>
);

export const SignalIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M3 17h3v4H3v-4Zm5-5h3v9H8v-9Zm5-5h3v14h-3V7Zm5-4h3v18h-3V3Z" />
  </svg>
);
