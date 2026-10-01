import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, RefreshCw, Inbox } from 'lucide-react';

export function LoadingSpinner({ text = 'جاري التحميل...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 space-y-4">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      <p className="text-sm font-semibold text-slate-600 animate-pulse">{text}</p>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 animate-pulse shadow-sm">
      <div className="h-44 bg-slate-200 rounded-xl w-full" />
      <div className="h-5 bg-slate-200 rounded w-3/4" />
      <div className="h-4 bg-slate-100 rounded w-full" />
      <div className="h-4 bg-slate-100 rounded w-2/3" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-6 bg-slate-200 rounded w-20" />
        <div className="h-9 bg-slate-200 rounded-lg w-28" />
      </div>
    </div>
  );
}

export function EmptyState({
  title = 'لا توجد بيانات حاليًا',
  description = 'لم يتم العثور على أي عناصر لعرضها في الوقت الحالي.',
  actionText,
  onAction,
}: {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center max-w-lg mx-auto my-8">
      <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
        <Inbox className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 shadow-md shadow-primary-500/20 transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

export function ErrorState({
  message = 'حدث خطأ غير متوقع أثناء جلب البيانات',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="bg-red-50/70 border border-red-200 rounded-2xl p-6 sm:p-8 text-center max-w-lg mx-auto my-8">
      <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-red-900 mb-1">عذرًا، حدث خطأ</h3>
      <p className="text-sm text-red-700 mb-5">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-xs hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}

export function AlertBanner({
  type = 'info',
  message,
}: {
  type?: 'info' | 'success' | 'warning' | 'error';
  message: string;
}) {
  const styles = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    error: 'bg-red-50 text-red-800 border-red-200',
  };

  const icons = {
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    success: <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-red-600 shrink-0" />,
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium ${styles[type]}`}>
      {icons[type]}
      <div className="flex-1">{message}</div>
    </div>
  );
}
