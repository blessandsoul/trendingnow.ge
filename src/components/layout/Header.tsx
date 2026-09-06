'use client';

/**
 * Compatibility entrance for older feature code.
 *
 * Public routes must share the single Bold Discovery storefront shell. Keeping
 * this adapter means a future import of the former generic Header cannot
 * silently bring the pre-rebrand navigation back onto a page.
 */
export { StorefrontHeader as Header } from '@/features/storefront/components/StorefrontHeader';
