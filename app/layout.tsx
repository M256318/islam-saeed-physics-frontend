import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/use-auth';

export const metadata: Metadata = {
  title: 'منصة مستر إسلام سعيد للفيزياء | الثانوية العامة والأزهرية',
  description: 'المنصة التعليمية الرائدة لمادة الفيزياء للثانوية العامة والأزهرية مع مستر إسلام سعيد - خبرة أكثر من 10 سنوات وشرح مبسط وتدريبات شاملة.',
  keywords: ['فيزياء', 'ثانوية عامة', 'مستر إسلام سعيد', 'فيزياء 3 ثانوي', 'فيزياء أزهر', 'منصة فيزياء'],
  authors: [{ name: 'مستر إسلام سعيد' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  icons: {
    icon: '/WEB.png',
    shortcut: '/WEB.png',
    apple: '/WEB.png',
  },
  openGraph: {
    title: 'منصة مستر إسلام سعيد للفيزياء | طريقك نحو الدرجة النهائية',
    description: 'شرح مبسط، تدريبات وحل مسائل، ومتابعة دورية مباشرة مع مستر إسلام سعيد.',
    type: 'website',
    locale: 'ar_EG',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen flex flex-col font-cairo bg-slate-50 text-slate-900 antialiased selection:bg-primary-500 selection:text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

