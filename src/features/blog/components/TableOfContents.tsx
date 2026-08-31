'use client';

import type React from 'react';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { ListIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { getBlogCopy } from '../lib/copy';
import type { BlogLocale } from '../lib/locales';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  locale: BlogLocale;
}

const emptySubscribe = (): (() => void) => () => {};

export function TableOfContents({ content, locale }: TableOfContentsProps): React.ReactElement | null {
  const [activeId, setActiveId] = useState('');
  const copy = getBlogCopy(locale);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const items = useMemo<TOCItem[]>(() => {
    if (!mounted) return [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    return Array.from(doc.querySelectorAll('h2, h3')).map((heading, index) => ({
      id: heading.id || `heading-${index}`,
      text: heading.textContent || '',
      level: Number.parseInt(heading.tagName[1] ?? '2', 10),
    }));
  }, [content, mounted]);

  useEffect(() => {
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0.1 },
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav aria-label={copy.tocTitle} className="rounded-[8px] border border-[#DFE6EF] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#07152A]">
        <ListIcon className="size-4 text-[#C89300]" />
        <span>{copy.tocTitle}</span>
      </div>
      <ol className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(event) => {
                event.preventDefault();
                const element = document.getElementById(item.id);
                if (element) {
                  const top = element.getBoundingClientRect().top + window.scrollY - 112;
                  window.scrollTo({ top, behavior: 'smooth' });
                }
              }}
              className={cn(
                'block py-1 text-sm transition-colors hover:text-[#C89300]',
                item.level === 3 && 'pl-4',
                activeId === item.id ? 'font-semibold text-[#C89300]' : 'text-[#526071]',
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
