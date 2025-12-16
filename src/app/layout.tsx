import type { Metadata } from 'next';
import '@/styles/globals.css';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import CartDrawer from '@/components/CartDrawer';
import ThemeToggle from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: 'Chatbot Platform — Starter',
  description: 'A clean starter for a multi-client chatbot platform with analytics.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider defaultTheme="system">
          <AuthProvider>
            <CartProvider>
              <ErrorBoundary>
              {children}
              <CartDrawer />
              {/* Floating Theme Toggle - Top Right (desktop only) */}
              <div className="hidden lg:block fixed top-4 right-4 z-50">
                <ThemeToggle
                  variant="icon"
                  size="md"
                  className="shadow-md hover:shadow-lg bg-surface-elevated border border-border"
                />
              </div>
              </ErrorBoundary>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
