"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useI18n } from "@/components/i18n-provider";
import {
  ArrowRight,
  Compass,
  Eye,
  Lock,
  Plus,
  Sparkle,
  Trash,
} from "@/components/icons";
import { BER_RATINGS, COUNTIES, PROPERTY_TYPES } from "@/lib/constants";
import type { TourType } from "@prisma/client";
import { saveProperty, type ActionState } from "./actions";
import type {
  PropertyFormImage,
  PropertyFormTour,
  PropertyFormValues,
} from "./property-form-types";

type Tab = "public" | "private" | "gallery" | "tours";

function SaveButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary px-7 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? pendingLabel : label}
      {!pending ? <ArrowRight className="text-sm" /> : null}
    </button>
  );
}

function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="label">{label}</span>
      {children}
      {hint ? <p className="mt-1.5 text-[10px] text-muted/70">{hint}</p> : null}
    </div>
  );
}

const tourTypes: TourType[] = ["PANORAMA", "MATTERPORT", "VIDEO"];

export function PropertyForm({ values }: { values: PropertyFormValues }) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("public");
  const [images, setImages] = useState<PropertyFormImage[]>(values.images);
  const [tours, setTours] = useState<PropertyFormTour[]>(values.tours);
  const [state, formAction] = useActionState<ActionState, FormData>(
    saveProperty,
    null,
  );

  const tabs: { id: Tab; label: string; icon: typeof Eye }[] = [
    { id: "public", label: t.admin.publicTab, icon: Eye },
    { id: "private", label: t.admin.privateTab, icon: Lock },
    { id: "gallery", label: t.admin.galleryTab, icon: Sparkle },
    { id: "tours", label: t.admin.toursTab, icon: Compass },
  ];

  function updateImage(index: number, patch: Partial<PropertyFormImage>) {
    setImages((current) =>
      current.map((image, i) => (i === index ? { ...image, ...patch } : image)),
    );
  }

  function setCover(index: number) {
    setImages((current) =>
      current.map((image, i) => ({ ...image, isCover: i === index })),
    );
  }

  function addImage() {
    setImages((current) => [
      ...current,
      { url: "", altEn: "", altEs: "", isCover: current.length === 0 },
    ]);
  }

  function removeImage(index: number) {
    setImages((current) => {
      const next = current.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((image) => image.isCover)) {
        next[0] = { ...next[0], isCover: true };
      }
      return next;
    });
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function updateTour(index: number, patch: Partial<PropertyFormTour>) {
    setTours((current) =>
      current.map((tour, i) => (i === index ? { ...tour, ...patch } : tour)),
    );
  }

  function addTour() {
    setTours((current) => [
      ...current,
      { type: "PANORAMA", titleEn: "", titleEs: "", url: "" },
    ]);
  }

  function removeTour(index: number) {
    setTours((current) => current.filter((_, i) => i !== index));
  }

  function moveTour(index: number, direction: -1 | 1) {
    setTours((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  const privateValues = values.private;

  return (
    <form
      action={formAction}
      onInvalidCapture={() => setTab("public")}
      className="mt-6"
    >
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <input type="hidden" name="imagesJson" value={JSON.stringify(images)} />
      <input type="hidden" name="toursJson" value={JSON.stringify(tours)} />

      <div className="hide-scrollbar flex gap-1 overflow-x-auto border-b border-line">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-current={tab === item.id}
            className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
              tab === item.id
                ? "border-pine text-pine"
                : "border-transparent text-muted hover:text-pine"
            }`}
          >
            <item.icon className="text-base" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {/* PUBLIC */}
        <div className={tab === "public" ? "space-y-8" : "hidden"}>
          <div className="rounded-2xl border border-line/80 bg-white/70 p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-2">
              <Eye className="text-lg text-gold" />
              <h2 className="font-display text-xl text-ink">
                {t.admin.publicSection}
              </h2>
            </div>
            <p className="-mt-2 mb-5 text-xs leading-relaxed text-muted">
              {t.admin.publicHelp}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t.admin.reference}>
                <input
                  name="reference"
                  defaultValue={values.reference}
                  required
                  maxLength={40}
                  placeholder="DUB-1042"
                  className="field uppercase"
                />
              </Field>
              <Field label={t.admin.status}>
                <select name="status" defaultValue={values.status} className="field">
                  {(
                    [
                      "DRAFT",
                      "PUBLISHED",
                      "SALE_AGREED",
                      "SOLD",
                      "LET_AGREED",
                    ] as const
                  ).map((status) => (
                    <option key={status} value={status}>
                      {t.status[status]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t.admin.listingType}>
                <select
                  name="listingType"
                  defaultValue={values.listingType}
                  className="field"
                >
                  <option value="SALE">{t.common.forSale}</option>
                  <option value="RENT">{t.common.forRent}</option>
                </select>
              </Field>
              <Field label={t.admin.propertyType}>
                <select
                  name="propertyType"
                  defaultValue={values.propertyType}
                  className="field"
                >
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {t.type[type]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t.listing.county}>
                <select name="county" defaultValue={values.county} className="field">
                  {COUNTIES.map((county) => (
                    <option key={county} value={county}>
                      Co. {county}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t.admin.slug} hint="/properties/your-slug">
                <input
                  name="slug"
                  defaultValue={values.slug}
                  maxLength={120}
                  className="field"
                />
              </Field>
            </div>
          </div>

          <div className="rounded-2xl border border-line/80 bg-white/70 p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t.admin.titleEn}>
                <input
                  name="titleEn"
                  defaultValue={values.titleEn}
                  required
                  maxLength={200}
                  className="field"
                />
              </Field>
              <Field label={t.admin.titleEs}>
                <input
                  name="titleEs"
                  defaultValue={values.titleEs}
                  maxLength={200}
                  className="field"
                />
              </Field>
              <Field label={t.admin.summaryEn}>
                <textarea
                  name="summaryEn"
                  defaultValue={values.summaryEn}
                  rows={3}
                  maxLength={400}
                  className="field resize-y"
                />
              </Field>
              <Field label={t.admin.summaryEs}>
                <textarea
                  name="summaryEs"
                  defaultValue={values.summaryEs}
                  rows={3}
                  maxLength={400}
                  className="field resize-y"
                />
              </Field>
              <Field label={t.admin.descriptionEn}>
                <textarea
                  name="descriptionEn"
                  defaultValue={values.descriptionEn}
                  rows={7}
                  className="field resize-y"
                />
              </Field>
              <Field label={t.admin.descriptionEs}>
                <textarea
                  name="descriptionEs"
                  defaultValue={values.descriptionEs}
                  rows={7}
                  className="field resize-y"
                />
              </Field>
            </div>
          </div>

          <div className="rounded-2xl border border-line/80 bg-white/70 p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t.admin.addressLine} className="sm:col-span-2">
                <input
                  name="addressLine"
                  defaultValue={values.addressLine}
                  required
                  maxLength={300}
                  className="field"
                />
              </Field>
              <Field label={t.admin.town}>
                <input
                  name="town"
                  defaultValue={values.town}
                  required
                  maxLength={120}
                  className="field"
                />
              </Field>
              <Field label={t.admin.eircode}>
                <input
                  name="eircode"
                  defaultValue={values.eircode}
                  maxLength={20}
                  className="field uppercase"
                />
              </Field>
              <Field label={t.admin.price}>
                <input
                  name="price"
                  type="number"
                  min={0}
                  defaultValue={values.price || ""}
                  required
                  className="field"
                />
              </Field>
              <Field label={t.admin.bedrooms}>
                <input
                  name="bedrooms"
                  type="number"
                  min={0}
                  defaultValue={values.bedrooms}
                  className="field"
                />
              </Field>
              <Field label={t.admin.bathrooms}>
                <input
                  name="bathrooms"
                  type="number"
                  min={0}
                  defaultValue={values.bathrooms}
                  className="field"
                />
              </Field>
              <Field label={`${t.property.floorArea} (${t.common.sqm})`}>
                <input
                  name="floorArea"
                  type="number"
                  min={0}
                  defaultValue={values.floorArea}
                  className="field"
                />
              </Field>
            </div>
          </div>

          <div className="rounded-2xl border border-line/80 bg-white/70 p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t.admin.berRating}>
                <select
                  name="berRating"
                  defaultValue={values.berRating}
                  className="field"
                >
                  <option value="">—</option>
                  {BER_RATINGS.map((rating) => (
                    <option key={rating} value={rating}>
                      {rating}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t.property.berNumber}>
                <input
                  name="berNumber"
                  defaultValue={values.berNumber}
                  maxLength={40}
                  className="field"
                />
              </Field>
              <Field label={t.property.yearBuilt}>
                <input
                  name="yearBuilt"
                  type="number"
                  min={1700}
                  max={new Date().getFullYear() + 5}
                  defaultValue={values.yearBuilt ?? ""}
                  className="field"
                />
              </Field>
              <Field label={t.property.heating}>
                <input
                  name="heating"
                  defaultValue={values.heating}
                  maxLength={120}
                  className="field"
                  placeholder="Gas central heating"
                />
              </Field>
              <Field label={t.admin.featuresEn} hint={t.admin.featuresHint}>
                <textarea
                  name="featuresEn"
                  defaultValue={values.featuresEn.join("\n")}
                  rows={5}
                  className="field resize-y"
                />
              </Field>
              <Field label={t.admin.featuresEs} hint={t.admin.featuresHint}>
                <textarea
                  name="featuresEs"
                  defaultValue={values.featuresEs.join("\n")}
                  rows={5}
                  className="field resize-y"
                />
              </Field>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-white/60 px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  name="furnished"
                  defaultChecked={values.furnished}
                  className="size-4 accent-[#123f2e]"
                />
                {t.property.furnished}
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-white/60 px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={values.featured}
                  className="size-4 accent-[#123f2e]"
                />
                {t.admin.featuredListing}
              </label>
            </div>
          </div>
        </div>

        {/* PRIVATE */}
        <div className={tab === "private" ? "space-y-5" : "hidden"}>
          <div className="flex items-start gap-3 rounded-2xl border border-gold/40 bg-[#fbf4e5] p-5">
            <Lock className="mt-0.5 shrink-0 text-lg text-gold" />
            <div>
              <h2 className="font-display text-lg text-ink">
                {t.admin.privateSection}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {t.admin.privateNotice}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-line/80 bg-white/70 p-5 sm:p-6">
            <h3 className="font-display text-lg text-ink">{t.admin.vendor}</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label={t.admin.vendorName}>
                <input
                  name="vendorName"
                  defaultValue={privateValues?.vendorName ?? ""}
                  className="field"
                />
              </Field>
              <Field label={t.admin.vendorPhone}>
                <input
                  name="vendorPhone"
                  defaultValue={privateValues?.vendorPhone ?? ""}
                  className="field"
                />
              </Field>
              <Field label={t.admin.vendorEmail}>
                <input
                  name="vendorEmail"
                  type="email"
                  defaultValue={privateValues?.vendorEmail ?? ""}
                  className="field"
                />
              </Field>
              <Field label={t.admin.guidePrice}>
                <input
                  name="guidePrice"
                  type="number"
                  min={0}
                  defaultValue={privateValues?.guidePrice ?? ""}
                  className="field"
                />
              </Field>
              <Field label={t.admin.commission}>
                <input
                  name="commissionRate"
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  defaultValue={privateValues?.commissionRate ?? ""}
                  className="field"
                />
              </Field>
              <Field label={t.admin.exclusiveUntil}>
                <input
                  name="exclusiveUntil"
                  type="date"
                  defaultValue={privateValues?.exclusiveUntil ?? ""}
                  className="field"
                />
              </Field>
            </div>
          </div>

          <div className="rounded-2xl border border-line/80 bg-white/70 p-5 sm:p-6">
            <h3 className="font-display text-lg text-ink">
              {t.admin.keys} / {t.admin.access}
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label={t.admin.keys}>
                <input
                  name="keysLocation"
                  defaultValue={privateValues?.keysLocation ?? ""}
                  className="field"
                />
              </Field>
              <Field label={t.admin.alarm}>
                <input
                  name="alarmCode"
                  defaultValue={privateValues?.alarmCode ?? ""}
                  className="field"
                />
              </Field>
              <Field label={t.admin.access} className="sm:col-span-2">
                <textarea
                  name="accessNotes"
                  defaultValue={privateValues?.accessNotes ?? ""}
                  rows={3}
                  className="field resize-y"
                />
              </Field>
            </div>
          </div>

          <div className="rounded-2xl border border-line/80 bg-white/70 p-5 sm:p-6">
            <h3 className="font-display text-lg text-ink">
              {t.admin.legalStatus}
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label={t.admin.solicitor}>
                <input
                  name="solicitor"
                  defaultValue={privateValues?.solicitor ?? ""}
                  className="field"
                />
              </Field>
              <Field label={t.admin.legalStatus}>
                <input
                  name="legalStatus"
                  defaultValue={privateValues?.legalStatus ?? ""}
                  className="field"
                />
              </Field>
              <Field label={t.admin.internalNotes} className="sm:col-span-2">
                <textarea
                  name="internalNotes"
                  defaultValue={privateValues?.internalNotes ?? ""}
                  rows={5}
                  className="field resize-y"
                />
              </Field>
            </div>
          </div>
        </div>

        {/* GALLERY */}
        <div className={tab === "gallery" ? "space-y-4" : "hidden"}>
          <div className="rounded-2xl border border-line/80 bg-white/70 p-5">
            <h2 className="font-display text-xl text-ink">{t.admin.images}</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">
              {t.admin.galleryHelp}
            </p>
          </div>

          {images.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line px-5 py-10 text-center text-sm text-muted">
              {t.admin.imagesEmpty}
            </p>
          ) : (
            images.map((image, index) => (
              <div
                key={index}
                className="rounded-2xl border border-line/80 bg-white/70 p-4"
              >
                <div className="flex gap-4">
                  <div className="relative size-24 shrink-0 overflow-hidden rounded-lg border border-line bg-sage">
                    {image.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image.url}
                        alt=""
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 space-y-3">
                    <Field label={`${t.admin.imageUrl} #${index + 1}`}>
                      <input
                        value={image.url}
                        onChange={(event) =>
                          updateImage(index, { url: event.target.value })
                        }
                        placeholder="https://…"
                        className="field"
                      />
                    </Field>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label={t.admin.altEn}>
                        <input
                          value={image.altEn}
                          onChange={(event) =>
                            updateImage(index, { altEn: event.target.value })
                          }
                          className="field"
                        />
                      </Field>
                      <Field label={t.admin.altEs}>
                        <input
                          value={image.altEs}
                          onChange={(event) =>
                            updateImage(index, { altEs: event.target.value })
                          }
                          className="field"
                        />
                      </Field>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line/70 pt-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-[11px] font-medium text-ink/80">
                    <input
                      type="radio"
                      name={`cover-${values.id ?? "new"}`}
                      checked={image.isCover}
                      onChange={() => setCover(index)}
                      className="size-3.5 accent-[#123f2e]"
                    />
                    {t.admin.cover}
                  </label>
                  <button
                    type="button"
                    onClick={() => moveImage(index, -1)}
                    className="text-[11px] text-muted hover:text-pine"
                  >
                    {t.admin.moveUp}
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(index, 1)}
                    className="text-[11px] text-muted hover:text-pine"
                  >
                    {t.admin.moveDown}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="ml-auto inline-flex items-center gap-1 text-[11px] text-[#a61b1b]"
                  >
                    <Trash className="text-sm" />
                    {t.admin.remove}
                  </button>
                </div>
              </div>
            ))
          )}

          <button type="button" onClick={addImage} className="btn-outline">
            <Plus className="text-sm" />
            {t.admin.addImage}
          </button>
        </div>

        {/* TOURS */}
        <div className={tab === "tours" ? "space-y-4" : "hidden"}>
          <div className="rounded-2xl border border-line/80 bg-white/70 p-5">
            <h2 className="font-display text-xl text-ink">
              {t.admin.mediaSection}
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">
              {t.admin.toursHelp}
            </p>
          </div>

          {tours.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line px-5 py-10 text-center text-sm text-muted">
              {t.admin.toursEmpty}
            </p>
          ) : (
            tours.map((tour, index) => (
              <div
                key={index}
                className="rounded-2xl border border-line/80 bg-white/70 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gold">
                    {t.admin.tourType} {index + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeTour(index)}
                    className="inline-flex items-center gap-1 text-[11px] text-[#a61b1b]"
                  >
                    <Trash className="text-sm" />
                    {t.admin.remove}
                  </button>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field label={t.admin.tourType}>
                    <select
                      value={tour.type}
                      onChange={(event) =>
                        updateTour(index, {
                          type: event.target.value as TourType,
                        })
                      }
                      className="field"
                    >
                      {tourTypes.map((type) => (
                        <option key={type} value={type}>
                          {t.tourType[type]}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label={t.admin.tourUrl}>
                    <input
                      value={tour.url}
                      onChange={(event) =>
                        updateTour(index, { url: event.target.value })
                      }
                      placeholder={
                        tour.type === "MATTERPORT"
                          ? "https://my.matterport.com/show/?m=…"
                          : tour.type === "VIDEO"
                            ? "https://youtu.be/…"
                            : "https://…/panorama.jpg"
                      }
                      className="field"
                    />
                  </Field>
                  <Field label={t.admin.tourTitleEn}>
                    <input
                      value={tour.titleEn}
                      onChange={(event) =>
                        updateTour(index, { titleEn: event.target.value })
                      }
                      className="field"
                    />
                  </Field>
                  <Field label={t.admin.tourTitleEs}>
                    <input
                      value={tour.titleEs}
                      onChange={(event) =>
                        updateTour(index, { titleEs: event.target.value })
                      }
                      className="field"
                    />
                  </Field>
                </div>

                <div className="mt-3 flex gap-3 border-t border-line/70 pt-3">
                  <button
                    type="button"
                    onClick={() => moveTour(index, -1)}
                    className="text-[11px] text-muted hover:text-pine"
                  >
                    {t.admin.moveUp}
                  </button>
                  <button
                    type="button"
                    onClick={() => moveTour(index, 1)}
                    className="text-[11px] text-muted hover:text-pine"
                  >
                    {t.admin.moveDown}
                  </button>
                </div>
              </div>
            ))
          )}

          <button type="button" onClick={addTour} className="btn-outline">
            <Plus className="text-sm" />
            {t.admin.addTour}
          </button>
        </div>
      </div>

      <div className="sticky bottom-4 z-20 mt-8 rounded-2xl border border-line bg-cream/95 p-3 shadow-[0_16px_40px_-24px_rgba(10,42,30,0.5)] backdrop-blur">
        {state?.error ? (
          <p
            role="alert"
            className="mb-2 rounded-lg border border-[#a61b1b]/25 bg-[#a61b1b]/5 px-3 py-2 text-xs text-[#8a1a1a]"
          >
            {state.error}
          </p>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/admin/properties"
            className="px-2 text-xs font-medium text-muted transition hover:text-pine"
          >
            {t.common.cancel}
          </Link>
          <SaveButton
            label={t.admin.saveProperty}
            pendingLabel={t.common.saving}
          />
        </div>
      </div>
    </form>
  );
}
