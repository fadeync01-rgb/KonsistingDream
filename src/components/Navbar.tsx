import React from 'react';
import { Sparkles, Bell, Shield, User, Compass, Bookmark, LayoutDashboard, Menu, X } from 'lucide-react';
import { UserAccount, AppNotification } from '../types';

interface NavbarProps {
  currentTab: 'home' | 'explore' | 'opportunities' | 'ai-assistant' | 'profile';
  onNavigate: (tab: 'home' | 'explore' | 'opportunities' | 'ai-assistant' | 'profile') => void;
  onOpenQuiz: () => void;
  onOpenAdmin: () => void;
  notifications: AppNotification[];
  user: UserAccount | null;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenQuiz,
  onOpenAdmin,
  notifications,
  user,
  savedCount
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 bg-[#faf9f6]/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-6 lg:gap-8">
        
        {/* Zone 1: Single-element brand wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="text-left group flex items-center gap-2 whitespace-nowrap shrink-0 focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center font-bold text-sm tracking-tighter shadow-sm">
            KD
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-stone-900 group-hover:text-amber-700 transition-colors">
            Konsisting Dream
          </span>
        </button>

        {/* Zone 2: Concise navigation links (5 items, single-line) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          <button
            onClick={() => onNavigate('home')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-stone-900 ${
              currentTab === 'home' ? 'text-stone-950 font-semibold' : ''
            }`}
          >
            Beranda
          </button>
          
          <button
            onClick={() => onNavigate('explore')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-stone-900 ${
              currentTab === 'explore' ? 'text-stone-950 font-semibold' : ''
            }`}
          >
            Jelajahi Kompetisi
          </button>

          <button
            onClick={() => onNavigate('opportunities')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-stone-900 flex items-center gap-1.5 ${
              currentTab === 'opportunities' ? 'text-stone-950 font-semibold' : ''
            }`}
          >
            Peluang Saya
            {savedCount > 0 && (
              <span className="text-[11px] font-mono tabular-nums text-stone-500">
                ({savedCount})
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('ai-assistant')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-stone-900 flex items-center gap-1.5 ${
              currentTab === 'ai-assistant' ? 'text-amber-700 font-semibold' : ''
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            AI Assistant
          </button>

          <button
            onClick={() => onNavigate('profile')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-stone-900 ${
              currentTab === 'profile' ? 'text-stone-950 font-semibold' : ''
            }`}
          >
            Profil
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action & Utility Triggers */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Admin Verification Modal Trigger */}
          <button
            onClick={onOpenAdmin}
            title="Panel Verifikasi Admin"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden lg:inline text-[11px]">Verifikasi</span>
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors relative"
              aria-label="Notifikasi"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-600 rounded-full" />
              )}
            </button>

            {/* Notification Drawer Popover */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-stone-200 rounded-xl shadow-lg p-3 z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                  <h4 className="text-xs font-semibold text-stone-900">Notifikasi & Tenggat</h4>
                  <span className="text-[11px] text-stone-500 tabular-nums">{notifications.length} pemberitahuan</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="p-2 rounded-lg bg-stone-50 text-xs text-stone-700">
                      <div className="font-medium text-stone-900">{n.title}</div>
                      <div className="text-stone-600 mt-0.5">{n.message}</div>
                      <div className="text-[10px] text-stone-400 mt-1 tabular-nums">{n.timestamp}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Primary CTA Button - Compact on mobile */}
          <button
            onClick={onOpenQuiz}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0 shadow-sm flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Temukan Peluang</span>
            <span className="sm:hidden text-[11px]">Kuis</span>
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-stone-600 hover:text-stone-900"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <button
            onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-sm font-medium text-stone-700 hover:text-stone-950"
          >
            Beranda
          </button>
          <button
            onClick={() => { onNavigate('explore'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-sm font-medium text-stone-700 hover:text-stone-950"
          >
            Jelajahi Kompetisi
          </button>
          <button
            onClick={() => { onNavigate('opportunities'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-sm font-medium text-stone-700 hover:text-stone-950"
          >
            Peluang Saya ({savedCount})
          </button>
          <button
            onClick={() => { onNavigate('ai-assistant'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-sm font-medium text-amber-700 hover:text-amber-900"
          >
            Konsisting Dream AI
          </button>
          <button
            onClick={() => { onNavigate('profile'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-sm font-medium text-stone-700 hover:text-stone-950"
          >
            Profil Saya
          </button>
          <button
            onClick={() => { onOpenAdmin(); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-sm font-medium text-stone-500 hover:text-stone-800 border-t border-stone-100 pt-3"
          >
            Panel Admin & Verifikasi Juknis
          </button>
        </div>
      )}
    </header>
  );
};
