import Link from "next/link";
import { getCompany } from "@/lib/company";
import { getI18n } from "@/lib/i18n-server";
import { LanguageToggle } from "./language-toggle";
import { ArrowUpRight, Mail, Phone, Pin } from "./icons";

export async function SiteFooter() {
  const { t, lang } = await getI18n();
  const company = await getCompany();
  const year = new Date().getFullYear();
  const tagline = lang === "es" ? company.taglineEs : company.taglineEn;

  return (
    <footer className="mt-24 bg-pine-deep text-cream/75">
      <div className="wrap grid gap-12 py-16 md:grid-cols-[1.6fr_1fr_1.2fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full border border-cream/25 font-display text-xl text-cream">
              H
            </span>
            <div>
              <p className="font-display text-xl text-cream">{company.name}</p>
              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.3em] text-cream/50">
                Property · Ireland
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed">{tagline}</p>
          <p className="mt-4 text-xs text-cream/45">
            {t.footer.psra}: {company.psra}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/40">
            {t.footer.explore}
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              { href: "/properties", label: t.nav.properties },
              { href: "/about", label: t.nav.about },
              { href: "/contact", label: t.nav.contact },
              { href: "/login", label: t.footer.admin },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex items-center gap-1.5 transition hover:text-cream"
                >
                  {link.label}
                  <ArrowUpRight className="text-[11px] opacity-50" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/40">
            {t.footer.contact}
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2.5">
              <Pin className="mt-0.5 shrink-0 text-base text-gold-light" />
              <span>{company.address}</span>
            </li>
            <li>
              <a href={`tel:${company.phone.replace(/\s/g, "")}`} className="flex gap-2.5 hover:text-cream">
                <Phone className="mt-0.5 shrink-0 text-base text-gold-light" />
                {company.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${company.email}`} className="flex gap-2.5 hover:text-cream">
                <Mail className="mt-0.5 shrink-0 text-base text-gold-light" />
                {company.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="wrap flex flex-col gap-4 py-6 text-xs text-cream/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {company.name}. {t.footer.rights}
          </p>
          <div className="flex items-center gap-5">
            <span>
              {t.footer.psra} {company.psra}
            </span>
            <LanguageToggle dark />
          </div>
        </div>
      </div>
    </footer>
  );
}
