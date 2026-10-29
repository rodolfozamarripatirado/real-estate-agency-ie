"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "./i18n-provider";
import { ChevronLeft, ChevronRight, Expand, X } from "./icons";

export type GalleryImage = {
  id?: string;
  url: string;
  altEn: string;
  altEs: string;
};

export function PropertyGallery({
  images,
  hint,
}: {
  images: GalleryImage[];
  hint: string;
}) {
  const { lang } = useI18n();
  const [index, setIndex] = useState<number | null>(null);

  const label = useCallback(
    (image: GalleryImage) =>
      lang === "es" && image.altEs ? image.altEs : image.altEn || "Property photo",
    [lang],
  );

  const close = useCallback(() => setIndex(null), []);
  const next = useCallback(
    () => setIndex((current) => (current === null ? null : (current + 1) % images.length)),
    [images.length],
  );
  const previous = useCallback(
    () =>
      setIndex((current) =>
        current === null ? null : (current - 1 + images.length) % images.length,
      ),
    [images.length],
  );

  useEffect(() => {
    if (index === null) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") previous();
    };

    document.addEventListener("keydown", onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [index, close, next, previous]);

  if (images.length === 0) return null;

  const secondary = images.slice(1, 3);

  return (
    <>
      <div className="relative grid overflow-hidden rounded-2xl bg-sage sm:grid-cols-[1.9fr_1fr] sm:grid-rows-2">
        <button
          type="button"
          onClick={() => setIndex(0)}
          className="group relative aspect-[4/3] w-full overflow-hidden sm:row-span-2 sm:aspect-auto sm:min-h-[420px]"
          aria-label={`${hint} (1/${images.length})`}
        >
          <Image
            src={images[0].url}
            alt={label(images[0])}
            fill
            priority
            sizes="(max-width: 640px) 100vw, 66vw"
            className="object-cover transition duration-700 group-hover:scale-[1.02]"
          />
        </button>

        {secondary.map((image, i) => (
          <button
            key={image.id ?? image.url}
            type="button"
            onClick={() => setIndex(i + 1)}
            className="group relative hidden overflow-hidden sm:block"
            aria-label={`${hint} (${i + 2}/${images.length})`}
          >
            <Image
              src={image.url}
              alt={label(image)}
              fill
              sizes="33vw"
              className="object-cover transition duration-700 group-hover:scale-[1.03]"
            />
          </button>
        ))}

        <button
          type="button"
          onClick={() => setIndex(0)}
          className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-cream/95 px-3.5 py-2 text-[11px] font-semibold text-pine shadow-sm transition hover:bg-white"
        >
          <Expand className="text-sm" />
          {images.length} {images.length === 1 ? "photo" : "photos"}
        </button>
      </div>

      {index !== null ? (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-[#07150f]/97 text-cream"
          role="dialog"
          aria-modal="true"
          aria-label={hint}
        >
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <p className="text-xs tracking-[0.16em] text-cream/60">
              {index + 1} / {images.length}
            </p>
            <button
              type="button"
              onClick={close}
              autoFocus
              className="grid size-10 place-items-center rounded-full border border-cream/20 text-cream/80 transition hover:bg-cream/10 hover:text-cream"
              aria-label="Close gallery"
            >
              <X className="text-lg" />
            </button>
          </div>

          <div className="relative flex-1">
            <Image
              src={images[index].url}
              alt={label(images[index])}
              fill
              sizes="100vw"
              className="object-contain p-2 sm:p-8"
            />
          </div>

          <div className="flex items-center justify-between gap-4 px-4 py-5 sm:px-6">
            <p className="max-w-lg truncate text-xs text-cream/60">
              {label(images[index])}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={previous}
                className="grid size-11 place-items-center rounded-full border border-cream/20 transition hover:bg-cream/10"
                aria-label="Previous photo"
              >
                <ChevronLeft className="text-lg" />
              </button>
              <button
                type="button"
                onClick={next}
                className="grid size-11 place-items-center rounded-full border border-cream/20 transition hover:bg-cream/10"
                aria-label="Next photo"
              >
                <ChevronRight className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
