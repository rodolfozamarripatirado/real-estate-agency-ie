import type {
  ListingType,
  PropertyStatus,
  PropertyType,
  TourType,
} from "@prisma/client";

export type PropertyFormImage = {
  url: string;
  altEn: string;
  altEs: string;
  isCover: boolean;
};

export type PropertyFormTour = {
  type: TourType;
  titleEn: string;
  titleEs: string;
  url: string;
};

export type PropertyFormPrivate = {
  vendorName: string;
  vendorPhone: string;
  vendorEmail: string;
  guidePrice: number | null;
  commissionRate: number | null;
  exclusiveUntil: string;
  keysLocation: string;
  alarmCode: string;
  accessNotes: string;
  solicitor: string;
  legalStatus: string;
  internalNotes: string;
};

export type PropertyFormValues = {
  id?: string;
  reference: string;
  slug: string;
  status: PropertyStatus;
  listingType: ListingType;
  propertyType: PropertyType;
  titleEn: string;
  titleEs: string;
  summaryEn: string;
  summaryEs: string;
  descriptionEn: string;
  descriptionEs: string;
  addressLine: string;
  town: string;
  county: string;
  eircode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  floorArea: number;
  berRating: string;
  berNumber: string;
  yearBuilt: number | null;
  heating: string;
  furnished: boolean;
  featuresEn: string[];
  featuresEs: string[];
  featured: boolean;
  images: PropertyFormImage[];
  tours: PropertyFormTour[];
  private: PropertyFormPrivate | null;
};

export const emptyPropertyForm: PropertyFormValues = {
  reference: "",
  slug: "",
  status: "DRAFT",
  listingType: "SALE",
  propertyType: "HOUSE",
  titleEn: "",
  titleEs: "",
  summaryEn: "",
  summaryEs: "",
  descriptionEn: "",
  descriptionEs: "",
  addressLine: "",
  town: "",
  county: "Dublin",
  eircode: "",
  price: 0,
  bedrooms: 0,
  bathrooms: 0,
  floorArea: 0,
  berRating: "",
  berNumber: "",
  yearBuilt: null,
  heating: "",
  furnished: false,
  featuresEn: [],
  featuresEs: [],
  featured: false,
  images: [],
  tours: [],
  private: {
    vendorName: "",
    vendorPhone: "",
    vendorEmail: "",
    guidePrice: null,
    commissionRate: null,
    exclusiveUntil: "",
    keysLocation: "",
    alarmCode: "",
    accessNotes: "",
    solicitor: "",
    legalStatus: "",
    internalNotes: "",
  },
};
