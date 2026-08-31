'use client';

import type React from 'react';
import { useRef, useState } from 'react';
import { ArrowLeftRight, ImagePlus, Loader2, Pencil, Trash2, X } from 'lucide-react';
import { Dialog } from 'radix-ui';

import { copy } from '@/i18n/copy';
import { cn } from '@/lib/utils';
import { publicMediaUrl } from '@/lib/utils/media';
import {
  DESCRIPTION_IMAGE_PRESETS,
  createUploadedDescriptionImage,
  isProductDescriptionImageSrc,
  type DescriptionImage,
  type DescriptionImageAlign,
} from './description-image-layout';

const adminCopy = copy.admin.editor;

export function DescriptionImageEditorDialog({
  images,
  open,
  onOpenChange,
  onChange,
  onDelete,
  onImageUpload,
  defaultImageAlt,
}: {
  images: DescriptionImage[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (images: DescriptionImage[]) => void;
  onDelete: () => void;
  onImageUpload?: (file: File) => Promise<string>;
  defaultImageAlt: string;
}): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingTarget, setPendingTarget] = useState<number | 'append' | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const isPair = images.length === 2;

  const updateImage = (index: number, patch: Partial<DescriptionImage>): void => {
    onChange(images.map((image, currentIndex) => (currentIndex === index ? { ...image, ...patch } : image)));
  };

  const removeImage = (index: number): void => {
    const nextImages = images.filter((_, currentIndex) => currentIndex !== index);
    if (nextImages.length === 0) {
      onDelete();
      onOpenChange(false);
      return;
    }
    onChange(nextImages);
  };

  const openImagePicker = (target: number | 'append'): void => {
    if (!onImageUpload) return;
    setPendingTarget(target);
    inputRef.current?.click();
  };

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    event.target.value = '';
    const target = pendingTarget;
    if (!file || !onImageUpload || target === null) return;

    setIsUploading(true);
    try {
      const src = await onImageUpload(file);
      if (!isProductDescriptionImageSrc(src)) return;
      const image = createUploadedDescriptionImage({ src, alt: defaultImageAlt });
      if (target === 'append') {
        if (images.length < 2) onChange([...images, image]);
      } else {
        updateImage(target, image);
      }
    } finally {
      setPendingTarget(null);
      setIsUploading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-[#07152A]/55 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-x-3 top-1/2 z-[70] max-h-[calc(100dvh-1.5rem)] -translate-y-1/2 overflow-hidden rounded-2xl border border-[#DFE6EF] bg-[#F6F8FB] shadow-[0_28px_90px_rgba(7,21,42,0.32)] sm:inset-x-6 lg:left-1/2 lg:right-auto lg:w-[min(760px,calc(100vw-3rem))] lg:-translate-x-1/2">
          <header className="flex items-start gap-3 border-b border-[#DFE6EF] bg-white px-4 py-3 sm:px-5">
            <div className="min-w-0">
              <Dialog.Title className="font-black tracking-tight text-[#07152A]">{adminCopy.richTextImageEditorTitle}</Dialog.Title>
              <Dialog.Description className="mt-0.5 text-xs leading-5 text-[#657286]">{adminCopy.richTextImageEditorDescription}</Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button type="button" aria-label={adminCopy.previewClose} className="ml-auto grid size-9 shrink-0 place-items-center rounded-full text-[#526071] transition hover:bg-[#EEF2F6] hover:text-[#07152A]">
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </header>

          <div className="max-h-[calc(100dvh-10rem)] overflow-y-auto p-4 sm:p-5">
            {onImageUpload && <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={(event) => { void uploadImage(event); }} />}

            <p className="mb-4 rounded-xl border border-[#DCE4EF] bg-white px-3 py-2 text-xs leading-5 text-[#657286]">
              {isPair ? adminCopy.richTextImagePairHint : adminCopy.richTextImageSingleHint}
            </p>

            <div className={cn('grid gap-4', isPair && 'sm:grid-cols-2')}>
              {images.map((image, index) => (
                <section key={`${image.src}-${index}`} className="overflow-hidden rounded-xl border border-[#DCE4EF] bg-white">
                  <div className="aspect-[4/3] bg-[#F4F7FA] p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={publicMediaUrl(image.src)} alt={image.alt} className="h-full w-full object-contain" />
                  </div>
                  <div className="grid gap-3 border-t border-[#E7ECF2] p-3">
                    <label className="grid gap-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#7A8595]">{adminCopy.richTextImageAlt}</span>
                      <input
                        value={image.alt}
                        onChange={(event) => updateImage(index, { alt: event.target.value })}
                        className="h-9 rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-warning focus:ring-[3px] focus:ring-warning/15"
                      />
                    </label>

                    {!isPair && (
                      <div className="grid gap-2">
                        <div className="flex flex-wrap gap-1.5">
                          {(Object.entries(DESCRIPTION_IMAGE_PRESETS) as Array<[keyof typeof DESCRIPTION_IMAGE_PRESETS, number]>).map(([preset, width]) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => updateImage(index, { width })}
                              className={cn('rounded-full border px-2.5 py-1 text-xs font-bold transition', image.width === width ? 'border-warning bg-warning/15 text-[#07152A]' : 'border-[#DCE4EF] text-[#657286] hover:border-warning')}
                            >
                              {adminCopy.richTextImagePresets[preset]}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(['left', 'center', 'right'] as DescriptionImageAlign[]).map((align) => (
                            <button
                              key={align}
                              type="button"
                              aria-pressed={image.align === align}
                              onClick={() => updateImage(index, { align })}
                              className={cn('rounded-md border px-2.5 py-1 text-xs font-bold transition', image.align === align ? 'border-warning bg-warning/15 text-[#07152A]' : 'border-[#DCE4EF] text-[#657286] hover:border-warning')}
                            >
                              {adminCopy.richTextImageAlign[align]}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {onImageUpload && (
                        <button type="button" disabled={isUploading} onClick={() => openImagePicker(index)} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#DCE4EF] px-2.5 text-xs font-bold text-[#526071] transition hover:border-warning hover:text-[#07152A] disabled:opacity-60">
                          {isUploading && pendingTarget === index ? <Loader2 className="size-3.5 animate-spin" /> : <Pencil className="size-3.5" />}
                          {adminCopy.richTextImageReplace}
                        </button>
                      )}
                      <button type="button" onClick={() => removeImage(index)} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-destructive/25 px-2.5 text-xs font-bold text-destructive transition hover:bg-destructive/10">
                        <Trash2 className="size-3.5" />
                        {adminCopy.richTextImageRemove}
                      </button>
                    </div>
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {onImageUpload && images.length < 2 && (
                <button type="button" disabled={isUploading} onClick={() => openImagePicker('append')} className="inline-flex h-9 items-center gap-2 rounded-md bg-[#07152A] px-3 text-sm font-bold text-white transition hover:bg-[#182D4B] disabled:opacity-60">
                  {isUploading && pendingTarget === 'append' ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                  {adminCopy.richTextImageAddSecond}
                </button>
              )}
              {images.length === 2 && (
                <button type="button" onClick={() => onChange([images[1], images[0]])} className="inline-flex h-9 items-center gap-2 rounded-md border border-[#DCE4EF] bg-white px-3 text-sm font-bold text-[#526071] transition hover:border-warning hover:text-[#07152A]">
                  <ArrowLeftRight className="size-4" />
                  {adminCopy.richTextImageSwap}
                </button>
              )}
              <button type="button" onClick={() => onOpenChange(false)} className="ml-auto inline-flex h-9 items-center rounded-md bg-[#FDC302] px-4 text-sm font-black text-[#07152A] transition hover:bg-[#E8B400]">
                {adminCopy.richTextImageDone}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
