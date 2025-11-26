import type { Metadata } from 'next';
import '@/styles/globals.css';
import ErrorBoundary from '@/components/ErrorBoundary';
import { CartProvider } from '@/contexts/CartContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import CartDrawer from '@/components/CartDrawer';

export const metadata: Metadata = {
  title: 'Chatbot Platform — Starter',
  description: 'A clean starter for a multi-client chatbot platform with analytics.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider defaultTheme="system">
          <CartProvider>
            <ErrorBoundary>
              {children}
              <CartDrawer />
            </ErrorBoundary>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
