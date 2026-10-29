import { cache } from "react";
import { prisma } from "./db";

export const COMPANY_FALLBACK = {
  id: 1,
  name: "Harbour & Oak",
  taglineEn: "Independent estate agents & property managers",
  taglineEs: "Agentes inmobiliarios y gestores de propiedades independientes",
  aboutEn:
    "Independent, PSRA-licensed estate agents and property managers serving Ireland since 1998.",
  aboutEs:
    "Agentes inmobiliarios y gestores de propiedades independientes con licencia PSRA, al servicio de Irlanda desde 1998.",
  phone: "+353 1 555 0142",
  email: "hello@harbourandoak.ie",
  address: "14 Fitzwilliam Square, Dublin 2, D02 XR20",
  psra: "003421",
  openingHours: "Mon–Fri, 9:00–18:00",
  heroImageUrl:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=85",
  updatedAt: new Date(0),
};

export type Company = typeof COMPANY_FALLBACK;

export const getCompany = cache(async (): Promise<Company> => {
  const settings = await prisma.companySettings.findUnique({ where: { id: 1 } });
  if (!settings) return COMPANY_FALLBACK;
  return {
    ...COMPANY_FALLBACK,
    ...settings,
    name: settings.name || COMPANY_FALLBACK.name,
    phone: settings.phone || COMPANY_FALLBACK.phone,
    email: settings.email || COMPANY_FALLBACK.email,
    address: settings.address || COMPANY_FALLBACK.address,
    heroImageUrl: settings.heroImageUrl || COMPANY_FALLBACK.heroImageUrl,
  };
});
