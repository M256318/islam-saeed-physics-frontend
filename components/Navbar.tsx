'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { NotificationService } from '@/services/data.service';
import { 
  Atom, 
  Menu, 
  X, 
  User as UserIcon, 
  Bell, 
  BookOpen, 
  Layers, 
  HelpCircle, 
  Phone, 
  LogOut, 
  LayoutDashboard,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      NotificationService.getNotifications()
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setUnreadCount(res.data.filter((n) => !n.isRead).length);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, pathname]);

  const navLinks = [
    { name: 'الرئيسية', href: '/' },
    { name: 'عن المستر', href: '/about' },
    { name: 'المحاضرات', href: '/lectures' },
    { name: 'تواصل معنا', href: '/contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3'
          : 'bg-white/70 backdrop-blur-sm py-4 border-b border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900/5 p-1 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform overflow-hidden relative">
              <Image
                src="/WEB.png"
                alt="منصة مستر إسلام سعيد للفيزياء"
                width={44}
                height={44}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight block">
                مستر إسلام سعيد
              </span>
              <span className="text-xs font-semibold text-primary-600 block -mt-1">
                منصة الفيزياء للثانوية العامة
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-primary-600 bg-primary-50/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* User Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {/* Notifications Link */}
                <Link
                  href={isAdmin ? '/admin/notifications' : '/dashboard/notifications'}
                  className="relative p-2 text-slate-600 hover:text-primary-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="الإشعارات"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                      {user.firstName ? user.firstName[0] : 'U'}
                    </div>
                    <span>{user.firstName}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      onMouseLeave={() => setUserDropdownOpen(false)}
                      className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-500">مرحبًا بك</p>
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-primary-600 font-mono mt-0.5">
                          {user.phoneNumber}
                        </p>
                      </div>

                      {isAdmin ? (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-700 font-medium"
                        >
                          <ShieldCheck className="w-4 h-4 text-primary-600" />
                          لوحة تحكم الإدارة
                        </Link>
                      ) : (
                        <>
                          <Link
                            href="/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-700 font-medium"
                          >
                            <LayoutDashboard className="w-4 h-4 text-primary-600" />
                            لوحة الطالب
                          </Link>
                          <Link
                            href="/dashboard/questions"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-700 font-medium"
                          >
                            <HelpCircle className="w-4 h-4 text-primary-600" />
                            اسأل المستر
                          </Link>
                          <Link
                            href="/dashboard/bookings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-700 font-medium"
                          >
                            <BookOpen className="w-4 h-4 text-primary-600" />
                            حجوزاتي
                          </Link>
                        </>
                      )}

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium text-right"
                        >
                          <LogOut className="w-4 h-4" />
                          تسجيل الخروج
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-primary-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm shadow-primary-500/20 transition-all hover:shadow-md"
                >
                  انضم إلينا الآن
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {isAuthenticated && (
              <Link
                href={isAdmin ? '/admin/notifications' : '/dashboard/notifications'}
                className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
              aria-label="القائمة الرئيسية"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-xl">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-semibold ${
                    isActive ? 'bg-primary-50 text-primary-600 font-bold' : 'text-slate-700'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-100 pt-3">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">مسجل الدخول باسم:</p>
                  <p className="text-sm font-bold text-slate-900">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
                {isAdmin ? (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-bold text-primary-700 bg-primary-50 rounded-lg"
                  >
                    لوحة تحكم الإدارة
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      لوحة الطالب
                    </Link>
                    <Link
                      href="/dashboard/questions"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      اسأل المستر
                    </Link>
                    <Link
                      href="/dashboard/bookings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      حجوزاتي
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-right px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg"
                >
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 rounded-lg"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-bold text-white bg-primary-600 rounded-lg shadow-sm"
                >
                  انضم الآن
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
