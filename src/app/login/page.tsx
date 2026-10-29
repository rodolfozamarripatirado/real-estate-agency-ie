import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getCompany } from "@/lib/company";
import { getI18n } from "@/lib/i18n-server";
import { LanguageToggle } from "@/components/language-toggle";
import { ArrowRight, Shield } from "@/components/icons";
import { LoginForm } from "./login-form";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t.meta.loginTitle,
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/admin");

  const { t } = await getI18n();
  const company = await getCompany();

  return (
    <div className="grid min-h-screen bg-cream lg:grid-cols-[1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-pine-deep p-12 text-cream lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 size-96 rounded-full border border-cream/10" />
        <div className="absolute -bottom-40 -left-20 size-[28rem] rounded-full border border-cream/10" />

        <Link href="/" className="relative flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-full border border-cream/25 font-display text-2xl">
            H
          </span>
          <span>
            <span className="block font-display text-xl">{company.name}</span>
            <span className="mt-1 block text-[9px] uppercase tracking-[0.3em] text-cream/50">
              Property · Ireland
            </span>
          </span>
        </Link>

        <div className="relative max-w-md">
          <p className="eyebrow text-gold-light">{t.auth.title}</p>
          <p className="mt-6 font-display text-4xl leading-tight">
            {t.home.title1} <em className="italic text-gold-light">{t.home.title2}</em>
          </p>
          <p className="mt-5 text-sm leading-relaxed text-cream/60">
            {t.auth.subtitle}
          </p>
        </div>

        <div className="relative flex items-center gap-2 text-xs text-cream/45">
          <Shield className="text-base text-gold-light" />
          PSRA {company.psra} · {company.address}
        </div>
      </aside>

      <main className="flex flex-col">
        <div className="flex items-center justify-between px-6 py-6 sm:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted transition hover:text-pine"
          >
            <ArrowRight className="rotate-180 text-sm" />
            {t.auth.backToSite}
          </Link>
          <LanguageToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-16 sm:px-10">
          <div className="w-full max-w-sm">
            <div className="mb-9 lg:hidden">
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full border border-pine/30 font-display text-lg text-pine">
                  H
                </span>
                <span className="font-display text-lg text-pine">{company.name}</span>
              </Link>
            </div>

            <p className="eyebrow">{t.footer.admin}</p>
            <h1 className="mt-3 font-display text-4xl leading-tight text-ink">
              {t.auth.title}
            </h1>
            <p className="mt-2 text-sm text-muted">{t.auth.subtitle}</p>

            <div className="mt-8">
              <LoginForm />
            </div>

            <p className="mt-8 text-center text-[11px] text-muted/70">
              © {new Date().getFullYear()} {company.name}
              {" · "}
              {t.footer.psra} {company.psra}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
