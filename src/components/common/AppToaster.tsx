'use client';

import type React from 'react';
import { AlertTriangle, CheckCircle2, Info, Loader2, X, XCircle } from 'lucide-react';
import { Toaster, type ToasterProps } from 'sonner';

type ToastClassNames = NonNullable<NonNullable<ToasterProps['toastOptions']>['classNames']>;
type ToastIcons = NonNullable<ToasterProps['icons']>;

const toastIconClassName = 'size-4 stroke-[2.4]';

const toastClassNames = {
  toast:
    'pointer-events-auto relative flex w-[min(360px,calc(100vw-24px))] items-start gap-3 overflow-hidden rounded-[10px] border bg-white px-3.5 py-3.5 font-sans text-[#101010] shadow-[0_18px_45px_rgba(8,21,42,0.16)] dark:bg-[#0D1828] dark:text-[#F7F9FB] dark:shadow-[0_18px_45px_rgba(0,0,0,0.42)]',
  content: 'min-w-0 flex-1 pr-5',
  title: 'text-sm font-semibold leading-5 text-[#101010] dark:text-[#F7F9FB]',
  description: 'mt-0.5 text-xs leading-5 text-[#526071] dark:text-[#A8B2BF]',
  icon:
    'mt-0.5 grid size-8 shrink-0 place-items-center rounded-[8px] border border-[#DFE6EF] bg-[#F7F9FB] text-[#101010] dark:border-white/15 dark:bg-[#142238] dark:text-[#F7F9FB]',
  closeButton:
    'absolute right-2 top-2 grid size-6 place-items-center rounded-full text-[#8B96A5] transition-colors hover:bg-[#EEF2F6] hover:text-[#101010] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#092BB4]/60 dark:hover:bg-white/10 dark:hover:text-[#F7F9FB]',
  actionButton:
    'ml-2 h-8 shrink-0 rounded-[8px] bg-[#092BB4] px-3 text-xs font-bold text-white transition-colors hover:bg-[#F02F48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#092BB4]/60',
  cancelButton:
    'ml-2 h-8 shrink-0 rounded-[8px] border border-[#DFE6EF] bg-white px-3 text-xs font-bold text-[#101010] transition-colors hover:bg-[#F7F9FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#092BB4]/60 dark:border-white/15 dark:bg-transparent dark:text-[#F7F9FB] dark:hover:bg-white/10',
  default: 'border-[#DFE6EF] bg-white dark:border-white/15 dark:bg-[#0D1828]',
  success:
    'border-[#D7EBDC] bg-[#FBFFFC] dark:border-[#1F6D37] dark:bg-[#0E1D16] [&_[data-icon]]:border-[#D7EBDC] [&_[data-icon]]:bg-[#F1FFF3] [&_[data-icon]]:text-[#2A9D4A] dark:[&_[data-icon]]:border-[#1F6D37] dark:[&_[data-icon]]:bg-[#142D1D] dark:[&_[data-icon]]:text-[#35C465]',
  error:
    'border-[#F1C6C1] bg-[#FFF7F6] dark:border-[#7B2C2B] dark:bg-[#241414] [&_[data-icon]]:border-[#F1C6C1] [&_[data-icon]]:bg-[#FFF0EF] [&_[data-icon]]:text-[#B42318] dark:[&_[data-icon]]:border-[#7B2C2B] dark:[&_[data-icon]]:bg-[#351B1B] dark:[&_[data-icon]]:text-[#FF6B5F]',
  warning:
    'border-[#F0C8CF] bg-[#EEF2FF] dark:border-[#7A3240] dark:bg-[#2A161A] [&_[data-icon]]:border-[#F0C8CF] [&_[data-icon]]:bg-[#FFE4E8] [&_[data-icon]]:text-[#061E81] dark:[&_[data-icon]]:border-[#7A3240] dark:[&_[data-icon]]:bg-[#3A1D23] dark:[&_[data-icon]]:text-[#FFE622]',
  info:
    'border-[#DDE2E9] bg-[#F4F2ED] dark:border-white/15 dark:bg-[#142238] [&_[data-icon]]:border-[#DDE2E9] [&_[data-icon]]:bg-white [&_[data-icon]]:text-[#101010] dark:[&_[data-icon]]:border-white/15 dark:[&_[data-icon]]:bg-[#202731] dark:[&_[data-icon]]:text-white',
  loading:
    'border-[#DFE6EF] bg-white dark:border-white/15 dark:bg-[#0D1828] [&_[data-icon]]:border-[#DFE6EF] [&_[data-icon]]:bg-[#F7F9FB] [&_[data-icon]]:text-[#101010] dark:[&_[data-icon]]:border-white/15 dark:[&_[data-icon]]:bg-[#142238] dark:[&_[data-icon]]:text-[#F7F9FB]',
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
