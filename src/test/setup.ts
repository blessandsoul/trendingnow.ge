import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, 'ResizeObserver', { writable: true, value: ResizeObserver });
Object.defineProperty(globalThis, 'ResizeObserver', { writable: true, value: ResizeObserver });

class PointerEvent extends MouseEvent {
  pointerId: number;

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 0;
  }
}

Object.defineProperty(window, 'PointerEvent', { writable: true, value: PointerEvent });
Object.defineProperty(globalThis, 'PointerEvent', { writable: true, value: PointerEvent });

Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { writable: true, value: vi.fn() });

Object.defineProperty(document, 'elementFromPoint', {
  writable: true,
  value: () => document.querySelectorAll('.ProseMirror img').item(document.querySelectorAll('.ProseMirror img').length - 1) ?? document.body,
});
