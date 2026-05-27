import React from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';
import { NightBackground } from '../visual/NightBackground';
import { AnimatedPage } from '../visual/AnimatedPage';
import { useLateNightMode } from '../../hooks/useLateNightMode';
import { cn } from '../../lib/cn';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const lateNight = useLateNightMode();

  return (
    <div className={cn('relative min-h-screen overflow-x-hidden bg-background text-text-primary font-sans', lateNight && 'late-night-mode')}>
      <NightBackground lateNight={lateNight} />
      <Header />
      <main className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-[calc(7.5rem+var(--gaga-safe-bottom))] pt-5 sm:px-5 md:pb-10">
        <AnimatedPage key={location.pathname}>{children}</AnimatedPage>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
