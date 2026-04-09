import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Flight Tracker Spain - Monitor Flight Delays',
  description: 'Monitor probable flight delays at Spanish airports. Check your flight before it happens and see the approximate probability of delay.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">✈️</text></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
