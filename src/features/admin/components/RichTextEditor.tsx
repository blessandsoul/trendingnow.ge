'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Unlink,
  type LucideIcon,
} from 'lucide-react';
import { Node } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import {
  EditorContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  useEditor,
  type Editor,
  type NodeViewProps,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import { copy } from '@/i18n/copy';
import { cn } from '@/lib/utils';
import { publicMediaUrl } from '@/lib/utils/media';
import { DescriptionImageEditorDialog } from './DescriptionImageEditorDialog';
import {
  createUploadedDescriptionImage,
  isProductDescriptionImageSrc,
  normalizeDescriptionImages,
  serializeDescriptionImageAttributes,
  type DescriptionImage,
} from './description-image-layout';

const adminCopy = copy.admin.editor;

type DescriptionImageExtensionOptions = {
  onImageUpload?: (file: File) => Promise<string>;
  getDefaultImageAlt?: () => string;
};

function ToolbarButton({
  active,
  label,
  disabled,
  onClick,
  icon: Icon,
}: {
  active?: boolean;
  label: string;
  disabled?: boolean;
  onClick: () => void;
  icon: LucideIcon;
}): React.ReactElement {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active ?? false}
      disabled={disabled}
      // Keep the editor selection alive while clicking toolbar buttons.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-full border transition disabled:opacity-60',
        active
          ? 'border-warning bg-warning/15 text-foreground'
          : 'border-border bg-card text-muted-foreground hover:border-warning hover:text-foreground',
      )}
    >
      <Icon className="size-3.5" />
    </button>
  );
}

function setLinkFromPrompt(editor: Editor): void {
  const previous = (editor.getAttributes('link').href as string | undefined) ?? '';
  const url = window.prompt(adminCopy.richTextLinkPrompt, previous);
  if (url === null) return;
  const trimmed = url.trim();
  if (trimmed.length === 0) {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }
  editor.chain().focus().extendMarkRange('link').setLink({ href: trimmed }).run();
}

function parseDescriptionImages(element: HTMLElement): DescriptionImage[] {
  const imageElements = element instanceof HTMLImageElement ? [element] : Array.from(element.querySelectorAll('img'));
  return normalizeDescriptionImages(imageElements.map((image) => ({
    src: image.getAttribute('src') ?? '',
    alt: image.getAttribute('alt') ?? '',
    width: Number(image.getAttribute('width')),
    align: image.getAttribute('data-align'),
  })));
}

function DescriptionImageNodeView({ node, selected, updateAttributes, deleteNode, extension }: NodeViewProps): React.ReactElement {
  const [open, setOpen] = useState(Boolean(node.attrs.openEditor));
  const images = normalizeDescriptionImages(node.attrs.images);
  const options = extension.options as DescriptionImageExtensionOptions;

  useEffect(() => {
    if (!node.attrs.openEditor) return;
    const timer = window.setTimeout(() => {
      setOpen(true);
      updateAttributes({ openEditor: false });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [node.attrs.openEditor, updateAttributes]);

  if (images.length === 0) return <NodeViewWrapper className="hidden" contentEditable={false} />;

  return (
    <NodeViewWrapper className="my-4 block" contentEditable={false}>
      <button
        type="button"
        aria-label={adminCopy.richTextImageEdit}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setOpen(true)}
        className={cn(
          'group w-full overflow-hidden rounded-xl border bg-white text-left shadow-sm transition hover:border-warning hover:shadow-md',
          selected ? 'border-warning ring-2 ring-warning/30' : 'border-[#DCE4EF]',
        )}
      >
        <div className={cn('grid gap-2 bg-[#F4F7FA] p-2', images.length === 2 && 'grid-cols-2')}>
          {images.map((image, index) => (
            <div key={`${image.src}-${index}`} className="flex h-24 items-center justify-center overflow-hidden rounded-lg bg-white p-2 sm:h-28">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={publicMediaUrl(image.src)} alt={image.alt} className="h-full w-full object-contain" draggable={false} />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-[#E7ECF2] px-3 py-2.5">
          <span className="text-xs font-bold text-[#526071]">{images.length === 2 ? adminCopy.richTextImageTwo : adminCopy.richTextImageOne}</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#07152A]">
            {adminCopy.richTextImageEdit}
            <ImagePlus className="size-3.5 text-[#C89300]" />
          </span>
        </div>
      </button>
      <DescriptionImageEditorDialog
        images={images}
        open={open}
        onOpenChange={setOpen}
        onChange={(nextImages) => updateAttributes({ images: nextImages })}
        onDelete={deleteNode}
        onImageUpload={options.onImageUpload}
        defaultImageAlt={options.getDefaultImageAlt?.() ?? ''}
      />
    </NodeViewWrapper>
  );
}

export const ProductDescriptionImage = Node.create<DescriptionImageExtensionOptions>({
  name: 'productDescriptionImage',
  group: 'block',
  atom: true,
  selectable: true,

  addOptions() {
    return {
      onImageUpload: undefined,
      getDefaultImageAlt: undefined,
    };
  },

  addAttributes() {
    return {
      images: {
        default: [],
        parseHTML: (element: HTMLElement) => parseDescriptionImages(element),
      },
      openEditor: {
        default: false,
        parseHTML: () => false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-description-image-row="true"]',
        getAttrs: (element: HTMLElement) => (parseDescriptionImages(element).length > 0 ? {} : false),
      },
      {
        tag: 'img',
        getAttrs: (element: HTMLElement) => (isProductDescriptionImageSrc(element.getAttribute('src')) ? {} : false),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const images = normalizeDescriptionImages((HTMLAttributes as { images?: unknown }).images);
    return [
      'div',
      { 'data-description-image-row': 'true' },
      ...images.map((image) => ['img', serializeDescriptionImageAttributes({
        src: image.src,
        alt: image.alt,
        width: image.width,
        align: image.align,
      })]),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DescriptionImageNodeView);
  },
});

export default function RichTextEditor({
  value,
  onChange,
  onImageUpload,
  defaultImageAlt = '',
}: {
  value: string;
  onChange: (html: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  defaultImageAlt?: string;
}): React.ReactElement {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false },
      }),
      ...(onImageUpload ? [ProductDescriptionImage.configure({
        onImageUpload,
        getDefaultImageAlt: () => defaultImageAlt,
      })] : []),
    ],
    content: value,
    immediatelyRender: false,
    // Toolbar active states must track the selection.
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor: current }) => {
      onChange(current.isEmpty ? '' : current.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const imageExtension = editor.extensionManager.extensions.find((extension) => extension.name === ProductDescriptionImage.name);
    if (!imageExtension) return;
    const options = imageExtension.options as DescriptionImageExtensionOptions;
    options.onImageUpload = onImageUpload;
    options.getDefaultImageAlt = () => defaultImageAlt;
  }, [defaultImageAlt, editor, onImageUpload]);

  // Drafts hydrate async (edit sheet loads server data after mount): sync the
  // external value in only when it actually differs and the admin isn't typing.
  useEffect(() => {
    if (!editor || editor.isFocused) return;
    const current = editor.isEmpty ? '' : editor.getHTML();
    if (current === value) return;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !onImageUpload || !editor) return;

    setIsUploadingImage(true);
    try {
      const src = await onImageUpload(file);
      if (!isProductDescriptionImageSrc(src)) return;
      const imageContent = {
        type: 'productDescriptionImage',
        attrs: {
          images: [createUploadedDescriptionImage({ src, alt: defaultImageAlt })],
          openEditor: true,
        },
      };
      const selection = editor.state.selection;
      const chain = editor.chain().focus();
      if (selection instanceof NodeSelection) {
        chain.insertContentAt(selection.to, imageContent).run();
      } else {
        chain.insertContent(imageContent).run();
      }
    } catch {
      // The upload mutation reports its own error toast; never leak a rejected
      // promise from this native input event.
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="grid gap-2">
      {onImageUpload && (
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => { void uploadImage(event); }}
        />
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        <ToolbarButton icon={Bold} label={adminCopy.richTextBold} active={editor?.isActive('bold')} disabled={!editor} onClick={() => editor?.chain().focus().toggleBold().run()} />
        <ToolbarButton icon={Italic} label={adminCopy.richTextItalic} active={editor?.isActive('italic')} disabled={!editor} onClick={() => editor?.chain().focus().toggleItalic().run()} />
        <ToolbarButton icon={Underline} label={adminCopy.richTextUnderline} active={editor?.isActive('underline')} disabled={!editor} onClick={() => editor?.chain().focus().toggleUnderline().run()} />
        <ToolbarButton icon={Strikethrough} label={adminCopy.richTextStrike} active={editor?.isActive('strike')} disabled={!editor} onClick={() => editor?.chain().focus().toggleStrike().run()} />
        <ToolbarButton icon={Heading2} label={adminCopy.richTextH2} active={editor?.isActive('heading', { level: 2 })} disabled={!editor} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} />
        <ToolbarButton icon={Heading3} label={adminCopy.richTextH3} active={editor?.isActive('heading', { level: 3 })} disabled={!editor} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} />
        <ToolbarButton icon={List} label={adminCopy.richTextBulletList} active={editor?.isActive('bulletList')} disabled={!editor} onClick={() => editor?.chain().focus().toggleBulletList().run()} />
        <ToolbarButton icon={ListOrdered} label={adminCopy.richTextOrderedList} active={editor?.isActive('orderedList')} disabled={!editor} onClick={() => editor?.chain().focus().toggleOrderedList().run()} />
        <ToolbarButton icon={Link2} label={adminCopy.richTextLink} active={editor?.isActive('link')} disabled={!editor} onClick={() => { if (editor) setLinkFromPrompt(editor); }} />
        <ToolbarButton icon={Unlink} label={adminCopy.richTextUnlink} disabled={!editor || !editor.isActive('link')} onClick={() => editor?.chain().focus().extendMarkRange('link').unsetLink().run()} />
        <ToolbarButton icon={RemoveFormatting} label={adminCopy.richTextClear} disabled={!editor} onClick={() => editor?.chain().focus().clearNodes().unsetAllMarks().run()} />
        {onImageUpload && (
          <ToolbarButton
            icon={isUploadingImage ? Loader2 : ImagePlus}
            label={isUploadingImage ? adminCopy.richTextImageUploading : adminCopy.richTextImageAdd}
            disabled={!editor || isUploadingImage}
            onClick={() => imageInputRef.current?.click()}
          />
        )}
      </div>
      <EditorContent
        editor={editor}
        className={cn(
          'rounded-md border border-input bg-transparent text-sm shadow-xs transition-[color,box-shadow]',
          'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
          'max-h-96 min-h-32 overflow-y-auto',
          '[&_.ProseMirror]:min-h-28 [&_.ProseMirror]:px-3 [&_.ProseMirror]:py-2 [&_.ProseMirror]:outline-none',
          '[&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h2]:mt-4 [&_.ProseMirror_h2]:text-lg [&_.ProseMirror_h2]:font-black',
          '[&_.ProseMirror_h3]:mb-1.5 [&_.ProseMirror_h3]:mt-3 [&_.ProseMirror_h3]:text-base [&_.ProseMirror_h3]:font-black',
          '[&_.ProseMirror_p]:my-1.5 [&_.ProseMirror_p]:leading-6',
          '[&_.ProseMirror_a]:font-bold [&_.ProseMirror_a]:text-info [&_.ProseMirror_a]:underline',
          '[&_.ProseMirror_ol]:my-1.5 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5',
          '[&_.ProseMirror_ul]:my-1.5 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5',
        )}
      />
    </div>
  );
}
