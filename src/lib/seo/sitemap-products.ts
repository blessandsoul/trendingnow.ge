import { absoluteUrl } from './metadata';

export interface SitemapProduct {
  slug: string;
  updatedAt: string;
}

export interface ProductSitemapPage {
  items: SitemapProduct[];
  totalPages: number;
}

export interface ProductSitemapEntry {
  url: string;
  lastModified?: Date;
}

export async function collectProductSitemapEntries(
  fetchPage: (page: number) => Promise<ProductSitemapPage>,
): Promise<ProductSitemapEntry[]> {
  try {
    const entries: ProductSitemapEntry[] = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const result = await fetchPage(page);
      totalPages = Math.max(1, result.totalPages);

      result.items.forEach((product) => {
        const lastModified = new Date(product.updatedAt);
        entries.push({
          url: absoluteUrl(`/products/${product.slug}`),
          ...(Number.isNaN(lastModified.getTime()) ? {} : { lastModified }),
        });
      });

      page += 1;
    }

    return entries;
  } catch {
    return [];
  }
}
