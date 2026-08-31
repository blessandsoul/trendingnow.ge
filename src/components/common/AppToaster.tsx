'use client';

import type React from 'react';
import { AlertTriangle, CheckCircle2, Info, Loader2, X, XCircle } from 'lucide-react';
import { Toaster, type ToasterProps } from 'sonner';

type ToastClassNames = NonNullable<NonNullable<ToasterProps['toastOptions']>['classNames']>;
type ToastIcons = NonNullable<ToasterProps['icons']>;

const toastIconClassName = 'size-4 stroke-[2.4]';

const toastClassNames = {
  toast:
    'pointer-events-auto relative flex w-[min(360px,calc(100vw-24px))] items-start gap-3 overflow-hidden rounded-[10px] border bg-white px-3.5 py-3.5 font-sans text-[#07152A] shadow-[0_18px_45px_rgba(8,21,42,0.16)] dark:bg-[#0D1828] dark:text-[#F7F9FB] dark:shadow-[0_18px_45px_rgba(0,0,0,0.42)]',
  content: 'min-w-0 flex-1 pr-5',
  title: 'text-sm font-extrabold leading-5 text-[#07152A] dark:text-[#F7F9FB]',
  description: 'mt-0.5 text-xs leading-5 text-[#526071] dark:text-[#A8B2BF]',
  icon:
    'mt-0.5 grid size-8 shrink-0 place-items-center rounded-[8px] border border-[#DFE6EF] bg-[#F7F9FB] text-[#07152A] dark:border-white/15 dark:bg-[#142238] dark:text-[#F7F9FB]',
  closeButton:
    'absolute right-2 top-2 grid size-6 place-items-center rounded-full text-[#8B96A5] transition-colors hover:bg-[#EEF2F6] hover:text-[#11141B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4057]/60 dark:hover:bg-white/10 dark:hover:text-[#F7F9FB]',
  actionButton:
    'ml-2 h-8 shrink-0 rounded-[8px] bg-[#FF4057] px-3 text-xs font-black text-white transition-colors hover:bg-[#F02F48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4057]/60',
  cancelButton:
    'ml-2 h-8 shrink-0 rounded-[8px] border border-[#DFE6EF] bg-white px-3 text-xs font-bold text-[#11141B] transition-colors hover:bg-[#F7F9FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4057]/60 dark:border-white/15 dark:bg-transparent dark:text-[#F7F9FB] dark:hover:bg-white/10',
  default: 'border-[#DFE6EF] bg-white dark:border-white/15 dark:bg-[#0D1828]',
  success:
    'border-[#D7EBDC] bg-[#FBFFFC] dark:border-[#1F6D37] dark:bg-[#0E1D16] [&_[data-icon]]:border-[#D7EBDC] [&_[data-icon]]:bg-[#F1FFF3] [&_[data-icon]]:text-[#2A9D4A] dark:[&_[data-icon]]:border-[#1F6D37] dark:[&_[data-icon]]:bg-[#142D1D] dark:[&_[data-icon]]:text-[#35C465]',
  error:
    'border-[#F1C6C1] bg-[#FFF7F6] dark:border-[#7B2C2B] dark:bg-[#241414] [&_[data-icon]]:border-[#F1C6C1] [&_[data-icon]]:bg-[#FFF0EF] [&_[data-icon]]:text-[#B42318] dark:[&_[data-icon]]:border-[#7B2C2B] dark:[&_[data-icon]]:bg-[#351B1B] dark:[&_[data-icon]]:text-[#FF6B5F]',
  warning:
    'border-[#D9C7FF] bg-[#F7F2FF] dark:border-[#6543A8] dark:bg-[#1E1730] [&_[data-icon]]:border-[#D9C7FF] [&_[data-icon]]:bg-[#EDE6FF] [&_[data-icon]]:text-[#5B2DB6] dark:[&_[data-icon]]:border-[#6543A8] dark:[&_[data-icon]]:bg-[#2A1E45] dark:[&_[data-icon]]:text-[#BFA4FF]',
  info:
    'border-[#CFE0FA] bg-[#F7FAFF] dark:border-[#315D9D] dark:bg-[#0D1A2B] [&_[data-icon]]:border-[#CFE0FA] [&_[data-icon]]:bg-[#EEF6FF] [&_[data-icon]]:text-[#1D5FD3] dark:[&_[data-icon]]:border-[#315D9D] dark:[&_[data-icon]]:bg-[#142A46] dark:[&_[data-icon]]:text-[#6BA4FF]',
  loading:
    'border-[#DFE6EF] bg-white dark:border-white/15 dark:bg-[#0D1828] [&_[data-icon]]:border-[#DFE6EF] [&_[data-icon]]:bg-[#F7F9FB] [&_[data-icon]]:text-[#07152A] dark:[&_[data-icon]]:border-white/15 dark:[&_[data-icon]]:bg-[#142238] dark:[&_[data-icon]]:text-[#F7F9FB]',
} satisfies ToastClassNames;

const toastIcons = {
  success: <CheckCircle2 className={toastIconClassName} />,
  error: <XCircle className={toastIconClassName} />,
  warning: <AlertTriangle className={toastIconClassName} />,
  info: <Info className={toastIconClassName} />,
  loading: <Loader2 className={`${toastIconClassName} animate-spin`} />,
  close: <X className="size-3.5 stroke-[2.4]" />,
} satisfies ToastIcons;

export function AppToaster(): React.ReactElement {
  return (
    <Toaster
      position="bottom-right"
      theme="light"
      closeButton
      duration={3200}
      gap={10}
      visibleToasts={2}
      offset={{ right: 24, bottom: 24 }}
      mobileOffset={{ right: 12, bottom: 16, left: 12 }}
      swipeDirections={['right', 'bottom']}
      containerAriaLabel="Notifications"
      toastOptions={{
        closeButton: true,
        unstyled: true,
        classNames: toastClassNames,
      }}
      icons={toastIcons}
    />
  );
}
