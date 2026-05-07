import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Re:Fit — Retrouve ton plein potentiel',
  description: 'Coaching sport, santé et bien-être. Breath & Shock, Ruck & Wild, Build & Play Padel.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
