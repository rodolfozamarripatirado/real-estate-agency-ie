"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import type { Role } from "@prisma/client";
import { useI18n } from "@/components/i18n-provider";
import { formatDate } from "@/lib/format";
import { ArrowRight, Check, Pencil, Plus, Trash } from "@/components/icons";
import { ConfirmButton } from "../confirm-button";
import {
  createUser,
  deleteUser,
  updateUser,
  type UserActionState,
} from "./actions";

export type StaffAccount = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
};

function roleLabel(role: Role, labels: { admin: string; agent: string }) {
  return role === "ADMIN" ? labels.admin : labels.agent;
}

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
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

function Feedback({ state }: { state: UserActionState }) {
  if (state?.error) {
    return (
      <p
        role="alert"
        className="rounded-xl border border-[#a61b1b]/25 bg-[#a61b1b]/5 px-4 py-3 text-sm text-[#8a1a1a]"
      >
        {state.error}
      </p>
    );
  }
  if (state?.ok) {
    return (
      <p className="flex items-center gap-2 rounded-xl border border-pine/20 bg-pine/5 px-4 py-3 text-sm text-pine">
        <Check className="text-base" />
        {state.message}
      </p>
    );
  }
  return null;
}

export function CreateUserForm() {
  const { t } = useI18n();
  const [state, formAction] = useActionState<UserActionState, FormData>(
    createUser,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-6 rounded-2xl border border-line/80 bg-white/70 p-5 sm:p-6"
    >
      <div className="flex items-center gap-2">
        <Plus className="text-pine" />
        <h2 className="font-display text-xl text-ink">{t.admin.users.addUser}</h2>
      </div>

      <div className="mt-4 space-y-4">
        <Feedback state={state} />

        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="label">{t.admin.users.name}</span>
            <input name="name" required maxLength={120} className="field" />
          </label>
          <label>
            <span className="label">{t.admin.users.email}</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="off"
              maxLength={200}
              className="field"
            />
          </label>
          <label>
            <span className="label">{t.admin.users.role}</span>
            <select name="role" defaultValue="AGENT" className="field">
              <option value="AGENT">{t.admin.users.roleAgent}</option>
              <option value="ADMIN">{t.admin.users.roleAdmin}</option>
            </select>
            <span className="mt-1 block text-[11px] text-muted">
              {t.admin.users.roleAgentHelp}
            </span>
          </label>
          <label>
            <span className="label">{t.admin.users.password}</span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="field"
            />
            <span className="mt-1 block text-[11px] text-muted">
              {t.admin.users.passwordHint}
            </span>
          </label>
        </div>

        <SubmitButton label={t.admin.users.create} pendingLabel="…" />
      </div>
    </form>
  );
}

export function UserRow({
  account,
  isCurrentUser,
}: {
  account: StaffAccount;
  isCurrentUser: boolean;
}) {
  const { t, lang } = useI18n();
  const [editing, setEditing] = useState(false);
  const [state, formAction] = useActionState<UserActionState, FormData>(
    updateUser,
    null,
  );

  return (
    <li className="rounded-2xl border border-line/80 bg-white/70 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-pine font-display text-sm text-cream">
            {account.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
              <span className="truncate">{account.name}</span>
              {isCurrentUser ? (
                <span className="rounded-full bg-pine/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-pine">
                  {t.admin.users.you}
                </span>
              ) : null}
            </p>
            <p className="truncate text-xs text-muted">{account.email}</p>
            <p className="mt-1 text-[11px] text-muted/80">
              {t.admin.users.joined} {formatDate(account.createdAt, lang)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${
              account.role === "ADMIN"
                ? "border-gold/40 bg-gold/15 text-[#8a6524]"
                : "border-pine/20 bg-pine/10 text-pine"
            }`}
          >
            {roleLabel(account.role, {
              admin: t.admin.users.roleAdmin,
              agent: t.admin.users.roleAgent,
            })}
          </span>
          <button
            type="button"
            onClick={() => setEditing((value) => !value)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-[11px] font-medium text-muted transition hover:border-pine/30 hover:text-pine"
          >
            <Pencil className="text-sm" />
            {editing ? t.admin.users.cancel : t.admin.users.edit}
          </button>
          {isCurrentUser ? null : (
            <form action={deleteUser}>
              <input type="hidden" name="id" value={account.id} />
              <ConfirmButton
                message={t.admin.users.deleteConfirm}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#a61b1b]/20 bg-white px-3 py-1.5 text-[11px] font-medium text-[#8a1a1a] transition hover:bg-[#a61b1b]/5"
              >
                <Trash className="text-sm" />
                {t.admin.users.delete}
              </ConfirmButton>
            </form>
          )}
        </div>
      </div>

      {editing ? (
        <form
          action={formAction}
          className="mt-4 space-y-4 border-t border-line/70 pt-4"
        >
          <input type="hidden" name="id" value={account.id} />
          <Feedback state={state} />

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="label">{t.admin.users.name}</span>
              <input
                name="name"
                defaultValue={account.name}
                required
                maxLength={120}
                className="field"
              />
            </label>
            <label>
              <span className="label">{t.admin.users.email}</span>
              <input
                name="email"
                type="email"
                defaultValue={account.email}
                required
                maxLength={200}
                className="field"
              />
            </label>
            <label>
              <span className="label">{t.admin.users.role}</span>
              <select
                name="role"
                defaultValue={account.role}
                disabled={isCurrentUser}
                className="field disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="AGENT">{t.admin.users.roleAgent}</option>
                <option value="ADMIN">{t.admin.users.roleAdmin}</option>
              </select>
              <span className="mt-1 block text-[11px] text-muted">
                {isCurrentUser
                  ? t.admin.users.cannotChangeOwnRole
                  : t.admin.users.roleAdminHelp}
              </span>
              {isCurrentUser ? (
                <input type="hidden" name="role" value={account.role} />
              ) : null}
            </label>
            <label>
              <span className="label">{t.admin.users.newPassword}</span>
              <input
                name="password"
                type="password"
                minLength={8}
                autoComplete="new-password"
                className="field"
              />
              <span className="mt-1 block text-[11px] text-muted">
                {t.admin.users.passwordHint}
              </span>
            </label>
          </div>

          <SubmitButton label={t.admin.users.save} pendingLabel="…" />
        </form>
      ) : null}
    </li>
  );
}
