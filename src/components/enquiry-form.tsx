"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createEnquiry, type EnquiryState } from "@/app/actions/enquiry";
import { useI18n } from "./i18n-provider";
import { ArrowRight, Check } from "./icons";

function Submit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? pendingLabel : label}
      {!pending ? <ArrowRight className="text-sm" /> : null}
    </button>
  );
}

export function EnquiryForm({
  propertyId,
  compact = false,
}: {
  propertyId?: string;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const [state, formAction] = useActionState<EnquiryState, FormData>(
    createEnquiry,
    null,
  );

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-pine/15 bg-pine/5 p-6 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-pine text-xl text-cream">
          <Check />
        </span>
        <p className="mt-4 font-display text-xl text-pine">{t.property.sent}</p>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          {t.property.sentText}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3.5">
      {propertyId ? <input type="hidden" name="propertyId" value={propertyId} /> : null}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {state?.error ? (
        <p
          role="alert"
          className="rounded-lg border border-[#a61b1b]/25 bg-[#a61b1b]/5 px-3 py-2 text-xs text-[#8a1a1a]"
        >
          {state.error}
        </p>
      ) : null}

      <div>
        <label htmlFor={`name-${propertyId ?? "general"}`} className="label">
          {t.property.name}
        </label>
        <input
          id={`name-${propertyId ?? "general"}`}
          name="name"
          required
          maxLength={120}
          className="field"
          autoComplete="name"
        />
      </div>

      <div className={compact ? "grid gap-3.5" : "grid gap-3.5 sm:grid-cols-2"}>
        <div>
          <label htmlFor={`email-${propertyId ?? "general"}`} className="label">
            {t.property.email}
          </label>
          <input
            id={`email-${propertyId ?? "general"}`}
            name="email"
            type="email"
            required
            maxLength={200}
            className="field"
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor={`phone-${propertyId ?? "general"}`} className="label">
            {t.property.phone}{" "}
            <span className="normal-case tracking-normal text-muted/60">
              ({t.common.optional})
            </span>
          </label>
          <input
            id={`phone-${propertyId ?? "general"}`}
            name="phone"
            type="tel"
            maxLength={60}
            className="field"
            autoComplete="tel"
          />
        </div>
      </div>

      <div>
        <label htmlFor={`message-${propertyId ?? "general"}`} className="label">
          {t.property.message}
        </label>
        <textarea
          id={`message-${propertyId ?? "general"}`}
          name="message"
          rows={compact ? 3 : 4}
          maxLength={3000}
          className="field resize-y"
          placeholder={t.property.messagePlaceholder}
        />
      </div>

      <div className="pt-1">
        <Submit label={t.property.send} pendingLabel={t.property.sending} />
      </div>
    </form>
  );
}
