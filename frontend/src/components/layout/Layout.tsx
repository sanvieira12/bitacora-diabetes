import React from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8">{children}</main>
      <Footer />
      <BottomNav />
    </div>
  );
}
