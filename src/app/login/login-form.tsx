"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useI18n } from "@/components/i18n-provider";
import { ArrowRight, Lock } from "@/components/icons";
import { loginAction, type LoginState } from "./actions";

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
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

export function LoginForm() {
  const { t } = useI18n();
  const [state, formAction] = useActionState<LoginState, FormData>(
    loginAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? (
        <p
          role="alert"
          className="rounded-xl border border-[#a61b1b]/25 bg-[#a61b1b]/5 px-4 py-3 text-sm text-[#8a1a1a]"
        >
          {state.error}
        </p>
      ) : null}

      <div>
        <label htmlFor="email" className="label">
          {t.auth.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="field"
          placeholder="you@harbourandoak.ie"
        />
      </div>

      <div>
        <label htmlFor="password" className="label">
          {t.auth.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="field"
          placeholder="••••••••"
        />
      </div>

      <div className="pt-2">
        <SubmitButton label={t.auth.signIn} pendingLabel={t.auth.signingIn} />
      </div>

      <p className="flex items-start gap-2 pt-2 text-[11px] leading-relaxed text-muted">
        <Lock className="mt-0.5 shrink-0 text-gold" />
        {t.auth.demoHint}
      </p>
    </form>
  );
}
