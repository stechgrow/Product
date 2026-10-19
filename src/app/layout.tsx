import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import '@/styles/layout.css';
import '@/styles/advisory.css';

export const metadata: Metadata = {
  title: 'Stechgrow - Advisory Dashboard',
  description: 'Stechgrow Advisory Recommendation and Business Intelligence Dashboard with actionable insights and diagnostics.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="%236200FF"/><path d="M21 11C21 8.8 19 7 16.5 7H11C8.8 7 7 8.8 7 11C7 13.2 8.8 15 11 15H21C23.2 15 25 16.8 25 19C25 21.2 23.2 23 21 23H12C9.8 23 8 21.2 8 19" stroke="%23FFFFFF" stroke-width="3" stroke-linecap="round" fill="none"/></svg>',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
