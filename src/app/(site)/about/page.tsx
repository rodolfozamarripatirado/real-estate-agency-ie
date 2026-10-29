import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCompany } from "@/lib/company";
import { getI18n } from "@/lib/i18n-server";
import {
  ArrowRight,
  Compass,
  Pin,
  Shield,
  Sparkle,
} from "@/components/icons";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.aboutTitle, description: t.meta.aboutDescription };
}

export default async function AboutPage() {
  const { t } = await getI18n();
  const company = await getCompany();

  return (
    <>
      <section className="border-b border-line/80 bg-parchment/50">
        <div className="wrap grid gap-8 py-14 sm:py-20 md:grid-cols-[1.2fr_1fr] md:items-end">
          <div>
            <p className="eyebrow">{t.about.eyebrow}</p>
            <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.05] text-ink sm:text-5xl">
              {t.about.title}
            </h1>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted md:pb-2">
            {t.about.intro}
          </p>
        </div>
      </section>

      <section className="wrap py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <p className="eyebrow">{t.about.storyTitle}</p>
            <h2 className="mt-3 font-display text-3xl leading-tight text-ink">
              {t.home.aboutTitle}
            </h2>
            <p className="mt-6 text-sm leading-[1.9] text-muted">
              {t.about.story1}
            </p>
            <p className="mt-4 text-sm leading-[1.9] text-muted">
              {t.about.story2}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-5 rounded-2xl border border-line/70 bg-white/50 p-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-pine/5 text-2xl text-pine">
                <Shield />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">
                  {t.contact.psraLabel}: {company.psra}
                </p>
                <p className="mt-1 text-xs text-muted">{t.about.psraNote}</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80"
                alt={t.about.storyTitle}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-5 left-5 right-5 rounded-xl border border-line bg-cream px-5 py-4 shadow-lg sm:left-8 sm:right-8">
              <p className="flex items-center gap-2 font-display text-lg text-pine">
                <Sparkle className="text-gold" />
                {t.home.statsYears} {t.common.year}
              </p>
              <p className="mt-0.5 text-[11px] text-muted">
                {t.home.statsYearsLabel}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grain border-y border-line/80 bg-parchment/50">
        <div className="wrap py-16">
          <div className="max-w-xl">
            <p className="eyebrow">{t.about.valuesTitle}</p>
            <h2 className="mt-3 font-display text-3xl leading-tight text-ink">
              {t.about.teamTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {t.about.teamText}
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Compass,
                title: t.about.value1Title,
                text: t.about.value1Text,
              },
              {
                icon: Pin,
                title: t.about.value2Title,
                text: t.about.value2Text,
              },
              {
                icon: Shield,
                title: t.about.value3Title,
                text: t.about.value3Text,
              },
            ].map((value, index) => (
              <article
                key={value.title}
                className="rounded-2xl border border-line/70 bg-cream/80 p-6"
              >
                <div className="flex items-center justify-between">
                  <value.icon className="text-2xl text-gold" />
                  <span className="font-display text-sm text-muted/40">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl text-ink">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {value.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap py-16">
        <div className="relative overflow-hidden rounded-3xl bg-pine px-7 py-12 text-cream sm:px-12">
          <div className="absolute -right-20 -top-24 size-80 rounded-full border border-cream/10" />
          <div className="relative grid gap-8 md:grid-cols-[1.4fr_auto] md:items-center">
            <div>
              <p className="eyebrow text-gold-light">{t.home.ctaEyebrow}</p>
              <h2 className="mt-3 max-w-xl font-display text-3xl leading-tight">
                {t.about.ctaTitle}
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-cream/70">
                {t.about.ctaText}
              </p>
            </div>
            <Link href="/contact" className="btn-gold">
              {t.about.ctaButton}
              <ArrowRight className="text-sm" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
