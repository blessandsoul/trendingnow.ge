import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DiscoveryPilot } from './DiscoveryPilot';
import { discoveryItems } from '../lib/discovery-pilot';
vi.mock('@/i18n/context', () => ({ useLocale: () => 'en', useLocalizedPath: () => (path: string) => path }));
vi.mock('./StorefrontHeader', () => ({ StorefrontHeader: () => null }));
vi.mock('./StorefrontFooter', () => ({ StorefrontFooter: () => null }));
const now = Math.max(...discoveryItems.map(item => Date.parse(item.checkedAt))) + 1;

describe('discovery shopping path', () => {
  it('filters the pilot by SKU without querying legacy inventory', () => {
    render(<DiscoveryPilot now={now} />);
    expect(screen.getAllByRole('article')).toHaveLength(18);
    fireEvent.change(screen.getByRole('searchbox', {name: 'Search model, item or SKU'}), {target: {value: 'I31167'}});
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByRole('link', {name: 'View details'})).toHaveAttribute('href','/products/find-pcshop-2');
  });
  it('identifies the external seller and renders the exact source photography', () => {
    render(<DiscoveryPilot now={now} item={discoveryItems[0]} />);
    const link=screen.getByRole('link',{name:/View at store/});
    expect(link).toHaveAttribute('href',`/go/${discoveryItems[0].id}`);
    expect(link).toHaveAttribute('target','_blank');
    expect(screen.getByRole('img', { name: discoveryItems[0].name })).toHaveAttribute('src', discoveryItems[0].imageUrl);
    expect(document.querySelector('a[href="/cart"]')).toBeNull();
    expect(screen.getByText(/Confirm stock and the final total at the store/)).toBeInTheDocument();
    expect(screen.getByRole('main')).toContainElement(screen.getByRole('button', {name:/Save product/}));
  });
  it('disables an expired offer instead of retaining an actionable stale link', () => {
    render(<DiscoveryPilot now={now+31*86400000} item={discoveryItems[0]} />);
    expect(screen.queryByRole('link',{name:/View at store/})).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('another review');
  });
  it('does not label an unknown price as confirmed after a recent source check', () => {
    render(<DiscoveryPilot now={now} item={{ ...discoveryItems[0], checkedAt: new Date(now - 1).toISOString(), price: null }} />);
    expect(screen.queryByText('Confirmed price')).not.toBeInTheDocument();
    expect(screen.getByText('Price needs an update')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View at store/ })).toBeInTheDocument();
  });
  it('shows the receiver limitation before the merchant action, with its primary source', () => {
    render(<DiscoveryPilot now={now} item={discoveryItems.find(item => item.id === 'pcshop-2')!} />);
    const limitation = screen.getByText('The compatible Logi Bolt USB receiver is not included.');
    const buy = screen.getByRole('link', {name:/View at store/});
    expect(limitation.compareDocumentPosition(buy) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole('link', {name:'Logitech'})).toHaveAttribute('href', expect.stringContaining('support.logi.com'));
  });
  it('uses an icon per specification without the former blue border in both views', () => {
    const view = render(<DiscoveryPilot now={now} />);
    expect(document.querySelectorAll('[data-product-specs] svg')).toHaveLength(4);
    expect(document.querySelector('[data-product-specs]')).not.toHaveClass('border-l-2');
    view.rerender(<DiscoveryPilot now={now} item={discoveryItems.find(item => item.id === 'pcshop-1')!} />);
    expect(document.querySelectorAll('[data-product-specs] svg')).toHaveLength(2);
    expect(document.querySelector('[data-product-specs]')?.parentElement).not.toHaveClass('border-l-2');
  });
  it('keeps draft typing local and commits one search on submission', () => {
    const onFiltersChange=vi.fn();
    render(<DiscoveryPilot now={now} onFiltersChange={onFiltersChange} />);
    const input=screen.getByRole('searchbox');
    fireEvent.change(input,{target:{value:'mausi'}});
    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(onFiltersChange).not.toHaveBeenCalled();
    fireEvent.submit(screen.getByRole('search'));
    expect(onFiltersChange).toHaveBeenCalledExactlyOnceWith({search:'mausi'});
  });
  it('restores URL filters on back navigation without remounting the search field', () => {
    const view=render(<DiscoveryPilot now={now} initialFilters={{search:'I31167'}} />);
    const input=screen.getByRole('searchbox');
    input.focus();
    view.rerender(<DiscoveryPilot now={now} initialFilters={{search:'mausi'}} />);
    expect(screen.getByRole('searchbox')).toBe(input);
    expect(input).toHaveValue('mausi');
    expect(input).toHaveFocus();
    expect(screen.getAllByRole('article')).toHaveLength(3);
  });
});
