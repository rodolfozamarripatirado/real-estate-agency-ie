"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { EnquiryStatus } from "@prisma/client";
import { useI18n } from "@/components/i18n-provider";
import { ArrowUpRight, Mail, Phone } from "@/components/icons";
import { updateEnquiry, type ActionState } from "../actions";

export type EnquiryItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: EnquiryStatus;
  internalNote: string;
  createdAtLabel: string;
  locale: string;
  property: { titleEn: string; titleEs: string; slug: string } | null;
};

function SaveButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-pine px-4 py-2 text-[11px] font-semibold text-cream transition hover:bg-pine-deep disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

export function EnquiryCard({ enquiry, lang }: { enquiry: EnquiryItem; lang: "en" | "es" }) {
  const { t } = useI18n();
  const [state, formAction] = useActionState<ActionState, FormData>(
    updateEnquiry,
    null,
  );

  const propertyTitle = enquiry.property
    ? lang === "es" && enquiry.property.titleEs
      ? enquiry.property.titleEs
      : enquiry.property.titleEn
    : null;

  return (
    <article className="rounded-2xl border border-line/80 bg-white/70 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg text-ink">{enquiry.name}</h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                enquiry.status === "NEW"
                  ? "bg-gold/20 text-[#8a6524]"
                  : enquiry.status === "CONTACTED"
                    ? "bg-pine/10 text-pine"
                    : "bg-line/60 text-muted"
              }`}
            >
              {t.enquiryStatus[enquiry.status]}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-muted/60">
              {enquiry.locale.toUpperCase()} · {enquiry.createdAtLabel}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-muted">
            <a
              href={`mailto:${enquiry.email}`}
              className="inline-flex items-center gap-1.5 hover:text-pine"
            >
              <Mail className="text-sm" />
              {enquiry.email}
            </a>
            {enquiry.phone ? (
              <a
                href={`tel:${enquiry.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1.5 hover:text-pine"
              >
                <Phone className="text-sm" />
                {enquiry.phone}
              </a>
            ) : null}
            {enquiry.property ? (
              <Link
                href={`/properties/${enquiry.property.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-pine hover:underline"
              >
                {propertyTitle}
                <ArrowUpRight className="text-xs" />
              </Link>
            ) : (
              <span className="text-muted/60">{t.contact.formTitle}</span>
            )}
          </div>
        </div>
      </div>

      <p className="mt-3 whitespace-pre-line rounded-xl bg-parchment/60 px-4 py-3 text-sm leading-relaxed text-ink/80">
        {enquiry.message}
      </p>

      <form action={formAction} className="mt-4 grid gap-3 border-t border-line/70 pt-4 sm:grid-cols-[160px_1fr_auto] sm:items-end">
        <input type="hidden" name="id" value={enquiry.id} />
        <div>
          <label htmlFor={`status-${enquiry.id}`} className="label">
            {t.admin.enquiryStatus}
          </label>
          <select
            id={`status-${enquiry.id}`}
            name="status"
            defaultValue={enquiry.status}
            className="field py-2 text-xs"
          >
            {(["NEW", "CONTACTED", "CLOSED"] as EnquiryStatus[]).map((status) => (
              <option key={status} value={status}>
                {t.enquiryStatus[status]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`note-${enquiry.id}`} className="label">
            {t.admin.internalNote}
          </label>
          <input
            id={`note-${enquiry.id}`}
            name="internalNote"
            defaultValue={enquiry.internalNote}
            maxLength={3000}
            className="field py-2 text-xs"
          />
        </div>
        <div className="flex items-center gap-3">
          {state?.ok ? (
            <span className="text-[10px] text-pine">{state.message}</span>
          ) : null}
          {state?.error ? (
            <span className="text-[10px] text-[#a61b1b]">{state.error}</span>
          ) : null}
          <SaveButton label={t.admin.update} pendingLabel={t.common.saving} />
        </div>
      </form>
    </article>
  );
}
