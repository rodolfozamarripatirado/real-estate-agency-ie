import type { Metadata } from "next";
import { getCompany } from "@/lib/company";
import { getI18n } from "@/lib/i18n-server";
import { EnquiryForm } from "@/components/enquiry-form";
import { Calendar, Mail, Phone, Pin, Shield } from "@/components/icons";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.contactTitle, description: t.meta.contactDescription };
}

export default async function ContactPage() {
  const { t } = await getI18n();
  const company = await getCompany();

  const details = [
    {
      icon: Phone,
      label: t.contact.phone,
      value: company.phone,
      href: `tel:${company.phone.replace(/\s/g, "")}`,
    },
    {
      icon: Mail,
      label: t.contact.email,
      value: company.email,
      href: `mailto:${company.email}`,
    },
    {
      icon: Pin,
      label: t.contact.office,
      value: company.address,
    },
    {
      icon: Calendar,
      label: t.contact.hours,
      value: company.openingHours,
    },
  ];

  return (
    <>
      <section className="border-b border-line/80 bg-parchment/50">
        <div className="wrap py-14 sm:py-20">
          <p className="eyebrow">{t.contact.eyebrow}</p>
          <div className="mt-4 grid gap-6 md:grid-cols-[1.3fr_1fr] md:items-end">
            <h1 className="max-w-2xl font-display text-4xl leading-[1.05] text-ink sm:text-5xl">
              {t.contact.title}
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-muted md:pb-2">
              {t.contact.intro}
            </p>
          </div>
        </div>
      </section>

      <section className="wrap py-14">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <h2 className="font-display text-2xl text-ink">
              {company.name}
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
              {t.footer.tagline}
            </p>

            <dl className="mt-8 space-y-6">
              {details.map((item) => (
                <div key={item.label} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-white/60 text-pine">
                    <item.icon className="text-lg" />
                  </span>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                      {item.label}
                    </dt>
                    <dd className="mt-1 text-sm text-ink/85">
                      {item.href ? (
                        <a
                          href={item.href}
                          className="transition hover:text-pine"
                        >
                          {item.value}
                        </a>
                      ) : (
                        item.value
                      )}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex items-start gap-3 rounded-xl border border-line/70 bg-white/50 p-4">
              <Shield className="mt-0.5 shrink-0 text-lg text-gold" />
              <p className="text-xs leading-relaxed text-muted">
                {t.contact.psraLabel}: {company.psra}. {t.about.psraNote}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-line/80 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(10,42,30,0.45)] sm:p-8">
            <h2 className="font-display text-2xl text-ink">
              {t.contact.formTitle}
            </h2>
            <p className="mt-2 text-sm text-muted">{t.contact.formIntro}</p>
            <div className="mt-6">
              <EnquiryForm />
            </div>
          </div>
        </div>

        <div className="mt-14">
          <h2 className="font-display text-2xl text-ink">{t.contact.mapTitle}</h2>
          <div className="relative mt-4 h-[340px] overflow-hidden rounded-2xl border border-line/80 bg-sage">
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                `${company.address}, Ireland`,
              )}&z=15&output=embed`}
              title={t.contact.mapTitle}
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
}
