import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { copy } from '@/i18n/copy';
import RichTextEditor, { ProductDescriptionImage } from './RichTextEditor';

const firstImage = {
  src: '/uploads/storefront/product/first-detail.webp',
  alt: 'First detail view',
  width: 520,
  align: 'center',
};

const secondImage = {
  src: '/uploads/storefront/product/second-detail.webp',
  alt: 'Second detail view',
  width: 720,
  align: 'right',
};

function createEditor(): Editor {
  return new Editor({
    element: document.createElement('div'),
    extensions: [StarterKit, ProductDescriptionImage],
  });
}

function imagePositions(editor: Editor): number[] {
  const positions: number[] = [];
  editor.state.doc.descendants((node, position) => {
    if (node.type.name === 'productDescriptionImage') positions.push(position);
  });
  return positions;
}

function imageElements(editor: Editor): HTMLImageElement[] {
  const documentForHtml = new DOMParser().parseFromString(editor.getHTML(), 'text/html');
  return Array.from(documentForHtml.querySelectorAll('img'));
}

function lastDescriptionImages(onChange: ReturnType<typeof vi.fn>): HTMLImageElement[] {
  const html = onChange.mock.calls.at(-1)?.[0];
  expect(typeof html).toBe('string');
  const documentForHtml = new DOMParser().parseFromString(html as string, 'text/html');
  return Array.from(documentForHtml.querySelectorAll('img'));
}

function lastDescriptionImage(onChange: ReturnType<typeof vi.fn>): HTMLImageElement {
  const [image] = lastDescriptionImages(onChange);
  expect(image).toBeDefined();
  return image;
}

describe('ProductDescriptionImage Tiptap extension', () => {
  let editor: Editor | undefined;

  afterEach(() => {
    editor?.destroy();
    editor = undefined;
  });

  it('reopens a persisted two-image row with only safe image markup', () => {
    editor = createEditor();

    editor.commands.setContent(
      `<div data-description-image-row="true"><img src="${firstImage.src}" alt="${firstImage.alt}" width="${firstImage.width}" data-align="${firstImage.align}"><img src="${secondImage.src}" alt="${secondImage.alt}" width="${secondImage.width}" data-align="${secondImage.align}"></div>`,
    );

    const beforeRemoval = imageElements(editor);
    expect(beforeRemoval).toHaveLength(2);
    const row = new DOMParser().parseFromString(editor.getHTML(), 'text/html').querySelector('[data-description-image-row]');
    expect(row?.getAttribute('data-description-image-row')).toBe('true');
    expect(beforeRemoval[0].getAttributeNames().sort()).toEqual(['alt', 'data-align', 'src', 'width']);
    expect(beforeRemoval[0].getAttribute('src')).toBe(firstImage.src);
    expect(beforeRemoval[0].getAttribute('alt')).toBe(firstImage.alt);
    expect(beforeRemoval[0].getAttribute('width')).toBe('520');
    expect(beforeRemoval[0].getAttribute('data-align')).toBe('center');
    expect(beforeRemoval[0].hasAttribute('style')).toBe(false);
    expect(beforeRemoval[0].hasAttribute('class')).toBe(false);
    expect(beforeRemoval[1].getAttribute('src')).toBe(secondImage.src);
    expect(beforeRemoval[1].getAttribute('alt')).toBe(secondImage.alt);
    expect(beforeRemoval[1].getAttribute('width')).toBe('720');
    expect(beforeRemoval[1].getAttribute('data-align')).toBe('right');

    expect(imagePositions(editor)).toHaveLength(1);
  });

  it('opens a full image editor after upload, creates a two-image row, and reopens it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const firstUrl = '/uploads/storefront/product/first-upload.webp';
    const secondUrl = '/uploads/storefront/product/second-upload.webp';
    const onImageUpload = vi.fn()
      .mockResolvedValueOnce(firstUrl)
      .mockResolvedValueOnce(secondUrl);
    const defaultAlt = 'Draft product name';
    const { container } = render(
      <RichTextEditor
        value=""
        onChange={onChange}
        onImageUpload={onImageUpload}
        defaultImageAlt={defaultAlt}
      />,
    );
    const imageInput = container.querySelector('input[type="file"]');
    if (!imageInput) throw new Error('Description image upload input is missing');

    await user.click(screen.getByRole('button', { name: copy.admin.editor.richTextImageAdd }));
    const firstFile = new File(['first image'], 'first.png', { type: 'image/png' });
    fireEvent.change(imageInput, { target: { files: [firstFile] } });

    await waitFor(() => expect(onImageUpload).toHaveBeenCalledWith(firstFile));
    await waitFor(() => expect(lastDescriptionImage(onChange).getAttribute('src')).toBe(firstUrl));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'მეორე სურათის დამატება' }));
    const secondFile = new File(['second image'], 'second.png', { type: 'image/png' });
    const imageInputs = document.querySelectorAll('input[type="file"]');
    expect(imageInputs).toHaveLength(2);
    fireEvent.change(imageInputs[1], { target: { files: [secondFile] } });

    await waitFor(() => expect(onImageUpload).toHaveBeenCalledWith(secondFile));
    await waitFor(() => expect(onChange.mock.calls.at(-1)?.[0]).toContain(secondUrl));
    const persisted = onChange.mock.calls.at(-1)?.[0] as string;
    expect(persisted).toContain('data-description-image-row="true"');
    expect(lastDescriptionImages(onChange)).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: 'მზადაა' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'სურათების რედაქტირება' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
