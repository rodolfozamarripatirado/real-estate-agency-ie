"use client";

import { useState } from "react";
import type { TourType } from "@prisma/client";
import { PanoramaViewer } from "./panorama-viewer";
import { useI18n } from "./i18n-provider";
import { Compass, Eye, Sparkle } from "./icons";

export type TourData = {
  id: string;
  type: TourType;
  titleEn: string;
  titleEs: string;
  url: string;
};

function videoEmbed(url: string): { kind: "iframe" | "video"; src: string } {
  const youtube =
    url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/i) ??
    null;
  if (youtube) {
    return {
      kind: "iframe",
      src: `https://www.youtube.com/embed/${youtube[1]}?rel=0`,
    };
  }

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) {
    return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}` };
  }

  return { kind: "video", src: url };
}

const typeIcon = {
  PANORAMA: Compass,
  MATTERPORT: Eye,
  VIDEO: Sparkle,
} as const;

export function TourSection({ tours }: { tours: TourData[] }) {
  const { lang, t } = useI18n();
  const [active, setActive] = useState(0);

  if (tours.length === 0) return null;

  const tour = tours[Math.min(active, tours.length - 1)];
  const title =
    lang === "es" && tour.titleEs ? tour.titleEs : tour.titleEn || t.tourType[tour.type];

  return (
    <section id="virtual-tour" className="scroll-mt-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{t.property.virtualTour}</p>
          <h2 className="mt-2 font-display text-2xl text-ink sm:text-3xl">
            {tour.type === "PANORAMA"
              ? t.property.panorama
              : tour.type === "MATTERPORT"
                ? t.property.matterport
                : t.property.video}
          </h2>
        </div>

        {tours.length > 1 ? (
          <div className="flex flex-wrap gap-1.5 rounded-full border border-line bg-white/60 p-1">
            {tours.map((option, index) => {
              const Icon = typeIcon[option.type];
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-pressed={index === active}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                    index === active
                      ? "bg-pine text-cream"
                      : "text-muted hover:text-pine"
                  }`}
                >
                  <Icon className="text-sm" />
                  {t.tourType[option.type]}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-line/80 bg-pine-deep">
        {tour.type === "PANORAMA" ? (
          <PanoramaViewer key={tour.id} src={tour.url} title={title} />
        ) : null}

        {tour.type === "MATTERPORT" ? (
          <div className="relative aspect-[16/10] w-full md:aspect-[16/9]">
            <iframe
              src={tour.url}
              title={title}
              className="absolute inset-0 h-full w-full"
              allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer"
              allowFullScreen
              loading="lazy"
            />
          </div>
        ) : null}

        {tour.type === "VIDEO"
          ? (() => {
              const embed = videoEmbed(tour.url);
              return embed.kind === "iframe" ? (
                <div className="relative aspect-video w-full">
                  <iframe
                    src={embed.src}
                    title={title}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              ) : (
                <video
                  src={embed.src}
                  controls
                  playsInline
                  className="aspect-video w-full bg-black"
                />
              );
            })()
          : null}
      </div>

      <p className="mt-2.5 text-[11px] text-muted">{t.property.tourHint}</p>
    </section>
  );
}
