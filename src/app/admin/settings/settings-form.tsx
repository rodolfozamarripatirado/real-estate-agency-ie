"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useI18n } from "@/components/i18n-provider";
import { ArrowRight, Check } from "@/components/icons";
import { saveSettings, type ActionState } from "../actions";

export type SettingsValues = {
  name: string;
  taglineEn: string;
  taglineEs: string;
  aboutEn: string;
  aboutEs: string;
  phone: string;
  email: string;
  address: string;
  psra: string;
  openingHours: string;
  heroImageUrl: string;
};

function SaveButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? pendingLabel : label}
      {!pending ? <ArrowRight className="text-sm" /> : null}
    </button>
  );
}

export function SettingsForm({ values }: { values: SettingsValues }) {
  const { t } = useI18n();
  const [state, formAction] = useActionState<ActionState, FormData>(
    saveSettings,
    null,
  );

  return (
    <form action={formAction} className="mt-6 space-y-5">
      {state?.ok ? (
        <p className="flex items-center gap-2 rounded-xl border border-pine/20 bg-pine/5 px-4 py-3 text-sm text-pine">
          <Check className="text-base" />
          {state.message ?? t.admin.settingsSaved}
        </p>
      ) : null}
      {state?.error ? (
        <p
          role="alert"
          className="rounded-xl border border-[#a61b1b]/25 bg-[#a61b1b]/5 px-4 py-3 text-sm text-[#8a1a1a]"
        >
          {state.error}
        </p>
      ) : null}

      <div className="rounded-2xl border border-line/80 bg-white/70 p-5 sm:p-6">
        <h2 className="font-display text-xl text-ink">
          {t.admin.contactDetails}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="label">{t.admin.companyName}</span>
            <input
              name="name"
              defaultValue={values.name}
              required
              maxLength={160}
              className="field"
            />
          </label>
          <label>
            <span className="label">{t.contact.phone}</span>
            <input
              name="phone"
              defaultValue={values.phone}
              maxLength={60}
              className="field"
            />
          </label>
          <label>
            <span className="label">{t.contact.email}</span>
            <input
              name="email"
              type="email"
              defaultValue={values.email}
              maxLength={200}
              className="field"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="label">{t.admin.address}</span>
            <input
              name="address"
              defaultValue={values.address}
              maxLength={300}
              className="field"
            />
          </label>
          <label>
            <span className="label">{t.admin.openingHours}</span>
            <input
              name="openingHours"
              defaultValue={values.openingHours}
              maxLength={200}
              className="field"
            />
          </label>
          <label>
            <span className="label">{t.admin.psra}</span>
            <input
              name="psra"
              defaultValue={values.psra}
              maxLength={40}
              className="field"
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-line/80 bg-white/70 p-5 sm:p-6">
        <h2 className="font-display text-xl text-ink">
          {t.admin.publicSection}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="label">{t.admin.taglineEn}</span>
            <input
              name="taglineEn"
              defaultValue={values.taglineEn}
              maxLength={300}
              className="field"
            />
          </label>
          <label>
            <span className="label">{t.admin.taglineEs}</span>
            <input
              name="taglineEs"
              defaultValue={values.taglineEs}
              maxLength={300}
              className="field"
            />
          </label>
          <label>
            <span className="label">{t.admin.aboutEn}</span>
            <textarea
              name="aboutEn"
              defaultValue={values.aboutEn}
              rows={5}
              maxLength={2000}
              className="field resize-y"
            />
          </label>
          <label>
            <span className="label">{t.admin.aboutEs}</span>
            <textarea
              name="aboutEs"
              defaultValue={values.aboutEs}
              rows={5}
              maxLength={2000}
              className="field resize-y"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="label">{t.admin.heroImage}</span>
            <input
              name="heroImageUrl"
              defaultValue={values.heroImageUrl}
              maxLength={2000}
              className="field"
              placeholder="https://…"
            />
          </label>
        </div>

        {values.heroImageUrl ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={values.heroImageUrl}
              alt=""
              className="h-40 w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : null}
      </div>

      <div className="flex justify-end">
        <SaveButton
          label={t.admin.saveSettings}
          pendingLabel={t.common.saving}
        />
      </div>
    </form>
  );
}
