import Link from "next/link";
import { getCompany } from "@/lib/company";
import { getI18n } from "@/lib/i18n-server";
import { LanguageToggle } from "./language-toggle";
import { Lock, Menu, ArrowRight } from "./icons";

export async function SiteHeader() {
  const { t } = await getI18n();
  const company = await getCompany();

  const links = [
    { href: "/properties", label: t.nav.properties },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/90 backdrop-blur-md">
      <div className="wrap flex h-20 items-center justify-between gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label={company.name}>
          <span className="grid size-11 place-items-center rounded-full border border-pine/30 font-display text-xl text-pine">
            H
          </span>
          <span className="leading-none">
            <span className="block font-display text-[19px] tracking-wide text-pine">
              {company.name}
            </span>
            <span className="mt-1.5 block text-[9px] font-semibold uppercase tracking-[0.3em] text-muted">
              Property · Ireland
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink/75 transition hover:text-pine"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <LanguageToggle />
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition hover:text-pine"
          >
            <Lock className="text-sm" />
            {t.nav.staff}
          </Link>
          <Link href="/contact" className="btn-primary px-4 py-2.5 text-xs">
            {t.nav.valuation}
            <ArrowRight className="text-sm" />
          </Link>
        </div>

        <details className="relative md:hidden">
          <summary
            className="grid size-11 cursor-pointer list-none place-items-center rounded-full border border-line text-pine marker:content-none"
            aria-label={t.nav.menu}
          >
            <Menu className="text-xl" />
          </summary>
          <div className="absolute right-0 top-13 z-50 w-64 rounded-2xl border border-line bg-cream p-4 shadow-xl">
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-pine/5"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-pine/5"
              >
                {t.footer.admin}
              </Link>
            </nav>
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
              <LanguageToggle />
              <Link href="/contact" className="text-xs font-semibold text-pine">
                {t.nav.valuation}
              </Link>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
