import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { copy } from '@/i18n/copy';
import { publicMediaUrl } from '@/lib/utils/media';
import { formatGel } from '@/features/storefront/lib/format';
import { ProductPreviewDialog } from './ProductPreviewDialog';

type MockImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fill?: boolean;
  loader?: unknown;
  placeholder?: unknown;
  priority?: boolean;
  quality?: number;
  unoptimized?: boolean;
};

vi.mock('next/image', () => ({
  default: (props: MockImageProps) => {
    const imageProps = { ...props };
    delete imageProps.fill;
    delete imageProps.loader;
    delete imageProps.placeholder;
    delete imageProps.priority;
    delete imageProps.quality;
    delete imageProps.unoptimized;
    return React.createElement('img', imageProps);
  },
}));

const descriptionImage = '/uploads/storefront/product/დეტალური-ხედვა-product-mrgio8ms.webp';
const secondDescriptionImage = '/uploads/storefront/product/მეორე-დეტალი-product-mrgio8mt.webp';
const mainImage = '/uploads/storefront/product/draft-main.webp';

const draft = {
  name: 'Unsaved product',
  brand: 'Continuum',
  description: `<p>Unsaved description</p><div data-description-image-row="true"><img src="${descriptionImage}" alt="Draft detail" width="520" data-align="center"><img src="${secondDescriptionImage}" alt="Second draft detail" width="520" data-align="center"></div>`,
  imageUrl: mainImage,
  salePrice: 199,
  originalPrice: 249,
};

describe('ProductPreviewDialog', () => {
  it('renders the current unsaved draft in a constrained phone preview', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ProductPreviewDialog draft={draft} open onOpenChange={vi.fn()} />);

    expect(screen.getByRole('heading', { name: draft.name })).toBeInTheDocument();
    expect(screen.getByText(formatGel(draft.salePrice))).toBeInTheDocument();
    expect(screen.getByAltText(draft.name)).toHaveAttribute('src', publicMediaUrl(mainImage));
    expect(screen.getByAltText('Draft detail')).toHaveAttribute('src', publicMediaUrl(descriptionImage));
    expect(screen.getByAltText('Second draft detail')).toHaveAttribute('src', publicMediaUrl(secondDescriptionImage));
    expect(screen.getByAltText('Draft detail').closest('[data-description-image-row]')).not.toBeNull();

    const updatedDraft = {
      ...draft,
      name: 'Edited without saving',
      imageUrl: '/uploads/storefront/product/edited-main.webp',
      salePrice: 499,
      description: `<p>Edited description</p><img src="${descriptionImage}" alt="Edited detail" width="320" data-align="left">`,
    };
    rerender(<ProductPreviewDialog draft={updatedDraft} open onOpenChange={vi.fn()} />);

    expect(screen.getByRole('heading', { name: updatedDraft.name })).toBeInTheDocument();
    expect(screen.getByText(formatGel(updatedDraft.salePrice))).toBeInTheDocument();
    expect(screen.getByAltText(updatedDraft.name)).toHaveAttribute('src', publicMediaUrl(updatedDraft.imageUrl));
    expect(screen.getByText('Edited description')).toBeInTheDocument();
    expect(screen.getByAltText('Edited detail')).toHaveAttribute('src', publicMediaUrl(descriptionImage));
    expect(screen.getByAltText('Edited detail')).toHaveAttribute('width', '320');
    expect(screen.getByAltText('Edited detail')).toHaveAttribute('data-align', 'left');

    await user.click(screen.getByRole('button', { name: copy.admin.editor.previewPhone }));

    expect(screen.getByRole('button', { name: copy.admin.editor.previewPhone })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByAltText(updatedDraft.name)).toHaveAttribute('sizes', '390px');

    const phoneFrame = screen.getByAltText(updatedDraft.name).closest('article')?.parentElement;
    expect(phoneFrame?.className).toContain('max-w-[390px]');

    const richText = screen.getByAltText('Edited detail').parentElement;
    expect(richText?.className).toContain('leading-6');
    expect(richText?.className).not.toContain('sm:text-base');
    expect(richText?.className).toContain('[&_img]:max-w-full');
  });
});
