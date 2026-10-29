import { PrismaClient, type TourType } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@harbourandoak.ie";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Harbour2026!";
const AGENT_EMAIL = process.env.AGENT_EMAIL || "agent@harbourandoak.ie";
const AGENT_PASSWORD = process.env.AGENT_PASSWORD || "Agent2026!";

type Photo = { photo: string; altEn: string; altEs: string };
type SeedTour = { type: TourType; titleEn: string; titleEs: string; url: string };
type SeedPrivate = {
  vendorName: string;
  vendorPhone: string;
  vendorEmail: string;
  guidePrice: number | null;
  commissionRate: number | null;
  exclusiveUntil: Date | null;
  keysLocation: string;
  alarmCode: string;
  accessNotes: string;
  solicitor: string;
  legalStatus: string;
  internalNotes: string;
};

type SeedProperty = {
  reference: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "SALE_AGREED" | "SOLD" | "LET_AGREED";
  listingType: "SALE" | "RENT";
  propertyType: "HOUSE" | "APARTMENT" | "TOWNHOUSE" | "DUPLEX" | "SITE" | "COMMERCIAL";
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
  lat: number;
  lng: number;
  featured: boolean;
  publishedAt: Date | null;
  photos: Photo[];
  tours: SeedTour[];
  private: SeedPrivate;
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;

const panorama = (titleEn: string, titleEs = titleEn): SeedTour => ({
  type: "PANORAMA",
  titleEn,
  titleEs,
  url: "/panoramas/living-room.jpg",
});

const properties: SeedProperty[] = [
  {
    reference: "DUB-1042",
    slug: "3-harbour-view-dalkey",
    status: "PUBLISHED",
    listingType: "SALE",
    propertyType: "HOUSE",
    titleEn: "3 Harbour View, Dalkey",
    titleEs: "3 Harbour View, Dalkey",
    summaryEn:
      "A handsome period home with uninterrupted views over Dalkey Sound, a private south-facing garden and a recently renovated kitchen.",
    summaryEs:
      "Una elegante casa de época con vistas ininterrumpidas a Dalkey Sound, jardín privado orientado al sur y cocina recientemente reformada.",
    descriptionEn:
      "Set behind a low stone wall on one of Dalkey's most sought-after roads, No. 3 Harbour View is a handsome period home that has been thoughtfully brought into the twenty-first century without losing its original character. The reception rooms retain their shutters, cornicing and open fires, while a glazed garden room opens onto a private, south-facing lawn.\n\nUpstairs there are four generous bedrooms, including a principal suite with views across the Sound towards Howth. Dalkey village, the DART and the coastal walks at Coliemore Harbour are all within a short walk.",
    descriptionEs:
      "Tras un muro de piedra en una de las calles más codiciadas de Dalkey, el número 3 de Harbour View es una elegante casa de época que se ha actualizado con criterio sin perder su carácter original. Los salones conservan contraventanas, molduras y chimeneas, mientras que un jardín de invierno acristalado se abre a un césped privado orientado al sur.\n\nEn la planta superior hay cuatro amplias habitaciones, incluida una suite principal con vistas a la bahía hacia Howth. El pueblo de Dalkey, el DART y los paseos costeros de Coliemore Harbour están a pocos minutos a pie.",
    addressLine: "3 Harbour View, Coliemore Road",
    town: "Dalkey",
    county: "Dublin",
    eircode: "A96 X4P2",
    price: 1_450_000,
    bedrooms: 4,
    bathrooms: 3,
    floorArea: 210,
    berRating: "B2",
    berNumber: "112345678",
    yearBuilt: 1928,
    heating: "Gas central heating",
    furnished: false,
    featuresEn: [
      "Panoramic views over Dalkey Sound",
      "Private south-facing garden",
      "Original period fireplaces and cornicing",
      "Recently upgraded kitchen with pantry",
      "Off-street parking for two cars",
      "Five minutes' walk to Dalkey village and DART",
    ],
    featuresEs: [
      "Vistas panorámicas a Dalkey Sound",
      "Jardín privado orientado al sur",
      "Chimeneas y molduras originales",
      "Cocina recientemente reformada con despensa",
      "Aparcamiento para dos coches",
      "A cinco minutos del pueblo de Dalkey y del DART",
    ],
    lat: 53.2739,
    lng: -6.1003,
    featured: true,
    publishedAt: new Date("2026-09-12T09:00:00Z"),
    photos: [
      { photo: "1600585154340-be6161a56a0c", altEn: "Front elevation of the period house", altEs: "Fachada de la casa de época" },
      { photo: "1600607687939-ce8a6c25118c", altEn: "Bright living room with garden views", altEs: "Salón luminoso con vistas al jardín" },
      { photo: "1600566753086-00f18fb6b3ea", altEn: "Dining area opening to the terrace", altEs: "Comedor abierto a la terraza" },
      { photo: "1600210492486-724fe5c67fb0", altEn: "Principal bedroom", altEs: "Dormitorio principal" },
      { photo: "1600585154526-990dced4db0d", altEn: "Private south-facing garden", altEs: "Jardín privado orientado al sur" },
    ],
    tours: [
      panorama("Living room 360°", "Salón 360°"),
      {
        type: "MATTERPORT",
        titleEn: "Interactive Matterport tour",
        titleEs: "Recorrido interactivo en Matterport",
        url: "https://my.matterport.com/show/?m=SxQL3iGyoDo",
      },
    ],
    private: {
      vendorName: "Mr & Mrs O'Connell",
      vendorPhone: "+353 87 234 5566",
      vendorEmail: "oconnell.vendor@example.ie",
      guidePrice: 1_400_000,
      commissionRate: 1.5,
      exclusiveUntil: new Date("2026-12-31T00:00:00Z"),
      keysLocation: "Office safe — box 12",
      alarmCode: "4821",
      accessNotes: "Key safe at side gate, code 1964. Please remove shoes.",
      solicitor: "Brophy & Co., 12 Fitzwilliam Square, Dublin 2",
      legalStatus: "Title deeds with solicitor — contracts being prepared",
      internalNotes:
        "Vendor keen to close before Christmas. Two viewings pending; do not discuss the guide price with buyers. BER cert in the shared drive.",
    },
  },
  {
    reference: "COR-2087",
    slug: "the-coach-house-kinsale",
    status: "PUBLISHED",
    listingType: "SALE",
    propertyType: "HOUSE",
    titleEn: "The Coach House, Kinsale",
    titleEs: "The Coach House, Kinsale",
    summaryEn:
      "A restored stone coach house tucked off Winter's Lane, with a walled courtyard and views over Kinsale harbour.",
    summaryEs:
      "Una casa de piedra restaurada en un rincón de Winter's Lane, con patio amurallado y vistas al puerto de Kinsale.",
    descriptionEn:
      "Dating from the 1840s, The Coach House has been carefully restored using traditional materials while adding every modern comfort. The double-height living space is centred on a wood-burning stove, with a mezzanine study above and French doors onto a sheltered courtyard.\n\nThe kitchen is hand-built in oak, and two of the three bedrooms overlook the harbour. Kinsale's restaurants, marina and coastal path are a five-minute walk away.",
    descriptionEs:
      "Construida en la década de 1840, The Coach House se ha restaurado con materiales tradicionales añadiendo todas las comodidades modernas. El salón de doble altura gira en torno a una estufa de leña, con un estudio en altillo y puertas francesas a un patio resguardado.\n\nLa cocina es de roble hecho a mano y dos de las tres habitaciones dan al puerto. Los restaurantes, el puerto deportivo y el paseo costero de Kinsale quedan a cinco minutos a pie.",
    addressLine: "The Coach House, Winter's Lane",
    town: "Kinsale",
    county: "Cork",
    eircode: "P17 YV30",
    price: 895_000,
    bedrooms: 3,
    bathrooms: 2,
    floorArea: 165,
    berRating: "C1",
    berNumber: "104567892",
    yearBuilt: 1840,
    heating: "Oil central heating & wood stove",
    furnished: false,
    featuresEn: [
      "Restored stone coach house",
      "Double-height living room with stove",
      "Walled courtyard garden",
      "Hand-built oak kitchen",
      "Harbour views from two bedrooms",
      "Five minutes' walk to Kinsale town centre",
    ],
    featuresEs: [
      "Antigua casa de piedra restaurada",
      "Salón de doble altura con estufa",
      "Patio amurallado",
      "Cocina de roble hecha a mano",
      "Vistas al puerto desde dos habitaciones",
      "A cinco minutos del centro de Kinsale",
    ],
    lat: 51.7069,
    lng: -8.5236,
    featured: true,
    publishedAt: new Date("2026-08-21T09:00:00Z"),
    photos: [
      { photo: "1600596542815-ffad4c1539a9", altEn: "Stone coach house exterior", altEs: "Exterior de la casa de piedra" },
      { photo: "1600573472592-401b489a3cdc", altEn: "Double-height living room", altEs: "Salón de doble altura" },
      { photo: "1600607688969-a5bfcd646154", altEn: "Oak kitchen", altEs: "Cocina de roble" },
      { photo: "1568605114967-8130f3a36994", altEn: "Courtyard garden", altEs: "Patio interior" },
    ],
    tours: [panorama("Ground floor 360°", "Planta baja 360°")],
    private: {
      vendorName: "Catherine Long",
      vendorPhone: "+353 86 771 2043",
      vendorEmail: "c.long@example.ie",
      guidePrice: 895_000,
      commissionRate: 1.75,
      exclusiveUntil: new Date("2026-11-30T00:00:00Z"),
      keysLocation: "At vendor's home — appointment only",
      alarmCode: "9027",
      accessNotes: "Vendor works from home; call 30 minutes before viewings.",
      solicitor: "Nolan Hayes, 4 Emmet Place, Cork",
      legalStatus: "Contracts issued to two parties",
      internalNotes:
        "Listed building consent documents are in the shared drive. Vendor will consider offers over €860k but will not accept a chain.",
    },
  },
  {
    reference: "GAL-3310",
    slug: "12-the-crescent-galway",
    status: "PUBLISHED",
    listingType: "RENT",
    propertyType: "APARTMENT",
    titleEn: "12 The Crescent, Galway City",
    titleEs: "12 The Crescent, Galway",
    summaryEn:
      "A light-filled two-bedroom apartment beside the Corrib, with a private balcony and secure parking.",
    summaryEs:
      "Un luminoso apartamento de dos habitaciones junto al Corrib, con balcón privado y aparcamiento seguro.",
    descriptionEn:
      "This second-floor apartment forms part of a small, well-managed development a short walk from Galway's Latin Quarter. Floor-to-ceiling glazing fills the open-plan living area with light, and a covered balcony looks across the river towards the cathedral.\n\nThe apartment is offered furnished, with two double bedrooms, a principal en suite and excellent storage throughout. Secure underground parking and a lift complete the package.",
    descriptionEs:
      "Este apartamento en segunda planta forma parte de una pequeña promoción bien gestionada a pocos pasos del barrio latino de Galway. Los ventanales de suelo a techo llenan de luz el salón de planta abierta, y un balcón cubierto mira al río hacia la catedral.\n\nSe ofrece amueblado, con dos dormitorios dobles, baño en suite en el principal y mucho almacenamiento. Incluye plaza de garaje subterránea y ascensor.",
    addressLine: "12 The Crescent, Fr Griffin Road",
    town: "Galway",
    county: "Galway",
    eircode: "H91 W2F8",
    price: 2_400,
    bedrooms: 2,
    bathrooms: 2,
    floorArea: 84,
    berRating: "A2",
    berNumber: "115678234",
    yearBuilt: 2019,
    heating: "Heat pump — underfloor heating",
    furnished: true,
    featuresEn: [
      "Furnished two-bedroom apartment",
      "Covered river-view balcony",
      "Secure underground parking",
      "A2-rated with heat pump",
      "Lift access",
      "Ten minutes' walk to Eyre Square",
    ],
    featuresEs: [
      "Apartamento amueblado de dos habitaciones",
      "Balcón cubierto con vistas al río",
      "Aparcamiento subterráneo seguro",
      "Certificado A2 con bomba de calor",
      "Acceso por ascensor",
      "A diez minutos de Eyre Square",
    ],
    lat: 53.2729,
    lng: -9.0603,
    featured: true,
    publishedAt: new Date("2026-09-30T09:00:00Z"),
    photos: [
      { photo: "1522708323590-d24dbb6b0267", altEn: "Open-plan living and dining area", altEs: "Salón y comedor de planta abierta" },
      { photo: "1502672260266-1c1ef2d93688", altEn: "Furnished living room", altEs: "Salón amueblado" },
      { photo: "1560448204-e02f11c3d0e2", altEn: "Principal bedroom", altEs: "Dormitorio principal" },
    ],
    tours: [
      {
        type: "VIDEO",
        titleEn: "Apartment video walkthrough",
        titleEs: "Vídeo del apartamento",
        url: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
      },
    ],
    private: {
      vendorName: "Galway Bay Properties Ltd",
      vendorPhone: "+353 91 555 210",
      vendorEmail: "management@galwaybayproperties.example",
      guidePrice: 2_400,
      commissionRate: 8,
      exclusiveUntil: new Date("2027-03-31T00:00:00Z"),
      keysLocation: "Keys in office cabinet — labelled GAL-3310",
      alarmCode: "0000",
      accessNotes: "Building fob required; collect from office. Vacant from 1 November.",
      solicitor: "Not applicable — landlord managed",
      legalStatus: "RTB registered. Rent pressure zone applies.",
      internalNotes:
        "Landlord has approved a 12-month lease with a break clause at six months. No pets. Ask for references and proof of income before viewing.",
    },
  },
  {
    reference: "KER-1178",
    slug: "sea-lodge-ballinskelligs",
    status: "PUBLISHED",
    listingType: "SALE",
    propertyType: "HOUSE",
    titleEn: "Sea Lodge, Ballinskelligs",
    titleEs: "Sea Lodge, Ballinskelligs",
    summaryEn:
      "A peaceful four-bedroom home a field away from the beach, with wide Atlantic views and a mature garden.",
    summaryEs:
      "Una tranquila casa de cuatro habitaciones a un campo de la playa, con amplias vistas al Atlántico y jardín maduro.",
    descriptionEn:
      "Sea Lodge sits at the end of a quiet lane on the Ring of Kerry, with nothing between the garden and the Atlantic but a field and the dunes. The house is comfortably finished and oriented to the view, with a large kitchen-living room and a sunroom that catches the evening light.\n\nThere are four bedrooms, a useful utility room and a detached garage. Ballinskelligs beach, the blue flag strand and the local shop are all within walking distance.",
    descriptionEs:
      "Sea Lodge está al final de un camino tranquilo en el Ring of Kerry, sin nada entre el jardín y el Atlántico salvo un campo y las dunas. La casa está cómodamente terminada y orientada a las vistas, con una amplia cocina-salón y un invernadero que recibe la luz de la tarde.\n\nTiene cuatro habitaciones, un cuarto de servicio y garaje independiente. La playa de Ballinskelligs, su arenal con bandera azul y la tienda local están a poca distancia a pie.",
    addressLine: "Sea Lodge, Dungeagan",
    town: "Ballinskelligs",
    county: "Kerry",
    eircode: "V23 HX59",
    price: 675_000,
    bedrooms: 4,
    bathrooms: 2,
    floorArea: 180,
    berRating: "C3",
    berNumber: "107812345",
    yearBuilt: 1975,
    heating: "Oil central heating",
    furnished: false,
    featuresEn: [
      "Direct Atlantic views",
      "Short walk to a blue flag beach",
      "Mature gardens with fruit trees",
      "Sunroom with sea views",
      "Detached garage and workshop",
      "Quiet lane on the Ring of Kerry",
    ],
    featuresEs: [
      "Vistas directas al Atlántico",
      "A pocos pasos de una playa con bandera azul",
      "Jardín maduro con árboles frutales",
      "Invernadero con vistas al mar",
      "Garaje y taller independientes",
      "Camino tranquilo en el Ring of Kerry",
    ],
    lat: 51.8261,
    lng: -10.2736,
    featured: false,
    publishedAt: new Date("2026-07-04T09:00:00Z"),
    photos: [
      { photo: "1512917774080-9991f1c4c750", altEn: "House with Atlantic views", altEs: "Casa con vistas al Atlántico" },
      { photo: "1580587771525-78b9dba3b914", altEn: "Kitchen and living area", altEs: "Cocina y salón" },
      { photo: "1600047509807-ba8f99d2cdde", altEn: "Sunroom", altEs: "Invernadero" },
      { photo: "1600566752355-35792bedcfea", altEn: "Bedroom with sea views", altEs: "Habitación con vistas al mar" },
    ],
    tours: [],
    private: {
      vendorName: "Patrick & Siobhán Murphy",
      vendorPhone: "+353 87 990 2145",
      vendorEmail: "murphy.ballinskelligs@example.ie",
      guidePrice: 675_000,
      commissionRate: 2,
      exclusiveUntil: new Date("2027-01-31T00:00:00Z"),
      keysLocation: "With next-door neighbour, Mrs Sheehan",
      alarmCode: "—",
      accessNotes: "Long lane — park at the gate. Neighbour has keys but please call ahead.",
      solicitor: "O'Sullivan & Co., Killarney",
      legalStatus: "Folio KE12345; maps ordered",
      internalNotes:
        "House is a holiday home and is currently let on Airbnb until 20 December. Viewings must be arranged around bookings. Vendor would consider a rent-back.",
    },
  },
  {
    reference: "LIM-4421",
    slug: "5-kings-terrace-limerick",
    status: "PUBLISHED",
    listingType: "RENT",
    propertyType: "TOWNHOUSE",
    titleEn: "5 King's Terrace, Limerick",
    titleEs: "5 King's Terrace, Limerick",
    summaryEn:
      "A characterful three-bedroom townhouse in the Georgian quarter, close to the university and city centre.",
    summaryEs:
      "Una casa adosada de tres habitaciones con carácter en el barrio georgiano, cerca de la universidad y el centro.",
    descriptionEn:
      "King's Terrace is a short, quiet row of Georgian townhouses within easy reach of Limerick's city centre, the university and the river walks at Curragower. No. 5 retains its high ceilings, original staircase and fireplaces, with a modern kitchen and bathroom to the rear.\n\nThe house is available unfurnished and would suit a family, professionals or students looking for a well-kept home with genuine character.",
    descriptionEs:
      "King's Terrace es una fila corta y tranquila de casas georgianas cerca del centro de Limerick, la universidad y los paseos del río en Curragower. El número 5 conserva techos altos, escalera y chimeneas originales, con cocina y baño modernos en la parte trasera.\n\nSe alquila sin amueblar y encajaría con una familia, profesionales o estudiantes que busquen una casa bien cuidada y con carácter.",
    addressLine: "5 King's Terrace, Ennis Road",
    town: "Limerick",
    county: "Limerick",
    eircode: "V94 T2K8",
    price: 1_950,
    bedrooms: 3,
    bathrooms: 1,
    floorArea: 110,
    berRating: "D1",
    berNumber: "109876543",
    yearBuilt: 1905,
    heating: "Gas central heating",
    furnished: false,
    featuresEn: [
      "Georgian townhouse with original features",
      "Three double bedrooms",
      "Private rear yard",
      "Walk to city centre and university",
      "Modern kitchen and bathroom",
      "Available unfurnished",
    ],
    featuresEs: [
      "Casa georgiana con elementos originales",
      "Tres habitaciones dobles",
      "Patio trasero privado",
      "A pie del centro y la universidad",
      "Cocina y baño modernos",
      "Disponible sin amueblar",
    ],
    lat: 52.6705,
    lng: -8.6326,
    featured: false,
    publishedAt: new Date("2026-09-02T09:00:00Z"),
    photos: [
      { photo: "1570129477492-45c003edd2be", altEn: "Georgian townhouse exterior", altEs: "Exterior de la casa georgiana" },
      { photo: "1493809842364-78817add7ffb", altEn: "Living room", altEs: "Salón" },
      { photo: "1560448075-bb485b067938", altEn: "Bedroom", altEs: "Habitación" },
    ],
    tours: [],
    private: {
      vendorName: "Margaret Doyle",
      vendorPhone: "+353 86 442 7781",
      vendorEmail: "m.doyle@example.ie",
      guidePrice: 1_950,
      commissionRate: 7,
      exclusiveUntil: new Date("2027-02-28T00:00:00Z"),
      keysLocation: "Office — key box 7",
      alarmCode: "—",
      accessNotes: "Tenant moving out 15 November; property will be cleaned before viewings.",
      solicitor: "Not applicable",
      legalStatus: "RTB registration to be renewed",
      internalNotes:
        "Landlord is flexible on lease length. Previous tenant left owing one month's rent — ensure references are checked carefully.",
    },
  },
  {
    reference: "WIC-2206",
    slug: "glenview-house-enniskerry",
    status: "PUBLISHED",
    listingType: "SALE",
    propertyType: "HOUSE",
    titleEn: "Glenview House, Enniskerry",
    titleEs: "Glenview House, Enniskerry",
    summaryEn:
      "A contemporary five-bedroom family home on a quiet cul-de-sac, with a large garden and views towards the Wicklow mountains.",
    summaryEs:
      "Una casa familiar contemporánea de cinco habitaciones en un callejón tranquilo, con gran jardín y vistas a las montañas de Wicklow.",
    descriptionEn:
      "Built in 2015 to a high specification, Glenview House offers generous, light-filled family accommodation over three floors. The kitchen is the heart of the home, opening onto a landscaped garden with a sheltered dining terrace and a lawn large enough for football.\n\nThere are five bedrooms, two en suite, a home office and a converted attic studio. Enniskerry village, Powerscourt Estate and the M50 are all within easy reach.",
    descriptionEs:
      "Construida en 2015 con una especificación alta, Glenview House ofrece amplias estancias familiares llenas de luz en tres plantas. La cocina es el corazón de la casa y se abre a un jardín ajardinado con terraza cubierta y un césped amplio.\n\nHay cinco habitaciones, dos en suite, despacho y un estudio en el ático. El pueblo de Enniskerry, Powerscourt y la M50 están cerca.",
    addressLine: "Glenview House, Ballyman Road",
    town: "Enniskerry",
    county: "Wicklow",
    eircode: "A98 K7X4",
    price: 1_250_000,
    bedrooms: 5,
    bathrooms: 4,
    floorArea: 280,
    berRating: "A3",
    berNumber: "116785432",
    yearBuilt: 2015,
    heating: "Air-to-water heat pump",
    furnished: false,
    featuresEn: [
      "A3-rated contemporary home",
      "Five bedrooms, two en suite",
      "Landscaped south-facing garden",
      "Home office and attic studio",
      "Air-to-water heat pump",
      "Walk to Enniskerry village",
    ],
    featuresEs: [
      "Casa contemporánea con certificado A3",
      "Cinco habitaciones, dos en suite",
      "Jardín ajardinado orientado al sur",
      "Despacho y estudio en el ático",
      "Bomba de calor aire-agua",
      "A pie del pueblo de Enniskerry",
    ],
    lat: 53.1918,
    lng: -6.1698,
    featured: false,
    publishedAt: new Date("2026-06-18T09:00:00Z"),
    photos: [
      { photo: "1583608205776-bfd35f0d9f83", altEn: "Contemporary house exterior", altEs: "Exterior de la casa contemporánea" },
      { photo: "1600607687920-4e2a09cf159d", altEn: "Open-plan kitchen", altEs: "Cocina de planta abierta" },
      { photo: "1616486338812-3dadae4b4ace", altEn: "Living room", altEs: "Salón" },
      { photo: "1615874959474-d609969a20ed", altEn: "Principal suite", altEs: "Suite principal" },
    ],
    tours: [panorama("Living room 360°", "Salón 360°")],
    private: {
      vendorName: "Dr Alan & Ruth Barrett",
      vendorPhone: "+353 87 665 3210",
      vendorEmail: "barrett.glenview@example.ie",
      guidePrice: 1_250_000,
      commissionRate: 1.5,
      exclusiveUntil: new Date("2026-12-15T00:00:00Z"),
      keysLocation: "Vendor holds keys — call before every viewing",
      alarmCode: "7712",
      accessNotes: "Alarm must be set when leaving. Do not use the side gate.",
      solicitor: "Kavanagh Solicitors, Bray",
      legalStatus: "Contracts not yet issued. Planning permission for attic in file.",
      internalNotes:
        "Vendor is relocating to Cork in January and is motivated. Will consider offers over €1.2m. Do not share the relocation reason with buyers.",
    },
  },
  {
    reference: "COR-2093",
    slug: "apartment-8-the-maltings-cork",
    status: "SALE_AGREED",
    listingType: "SALE",
    propertyType: "APARTMENT",
    titleEn: "Apartment 8, The Maltings, Cork",
    titleEs: "Apartamento 8, The Maltings, Cork",
    summaryEn:
      "A two-bedroom city-centre apartment with a private terrace, sold with vacant possession.",
    summaryEs:
      "Un apartamento de dos habitaciones en el centro, con terraza privada, se vende libre de inquilinos.",
    descriptionEn:
      "Apartment 8 is a well-proportioned two-bedroom home in a converted Maltings building on the edge of Cork's historic centre. The open-plan living space opens onto a private terrace, and both bedrooms are doubles with built-in storage.\n\nThe apartment is offered with vacant possession and would suit an owner-occupier or investor. Parking is available by separate arrangement.",
    descriptionEs:
      "El apartamento 8 es una vivienda bien proporcionada de dos habitaciones en un edificio Maltings rehabilitado en el borde del centro histórico de Cork. El salón de planta abierta se abre a una terraza privada y ambas habitaciones son dobles con armarios.\n\nSe vende libre de inquilinos y encaja con propietarios o inversores. El aparcamiento se gestiona aparte.",
    addressLine: "Apartment 8, The Maltings, Kyrl's Quay",
    town: "Cork",
    county: "Cork",
    eircode: "T12 F8Y2",
    price: 395_000,
    bedrooms: 2,
    bathrooms: 1,
    floorArea: 68,
    berRating: "B3",
    berNumber: "108765432",
    yearBuilt: 2005,
    heating: "Electric storage heating",
    furnished: false,
    featuresEn: [
      "City-centre location",
      "Private terrace",
      "Two double bedrooms",
      "Vacant possession",
      "Lift access",
      "Walk to Kent Station",
    ],
    featuresEs: [
      "Ubicación céntrica",
      "Terraza privada",
      "Dos habitaciones dobles",
      "Libre de inquilinos",
      "Acceso por ascensor",
      "A pie de Kent Station",
    ],
    lat: 51.9016,
    lng: -8.4724,
    featured: false,
    publishedAt: new Date("2026-05-11T09:00:00Z"),
    photos: [
      { photo: "1554995207-c18c203602cb", altEn: "Living area", altEs: "Salón" },
      { photo: "1502005229762-cf1b2da7c5d6", altEn: "Dining area", altEs: "Comedor" },
      { photo: "1556912167-f556f1f39fdf", altEn: "Kitchen", altEs: "Cocina" },
    ],
    tours: [],
    private: {
      vendorName: "John & Niamh Cotter",
      vendorPhone: "+353 85 112 9987",
      vendorEmail: "cotter.john@example.ie",
      guidePrice: 395_000,
      commissionRate: 1.75,
      exclusiveUntil: new Date("2026-11-15T00:00:00Z"),
      keysLocation: "Office key cabinet — CORK-2093",
      alarmCode: "—",
      accessNotes: "Apartment is vacant. Keys available during office hours only.",
      solicitor: "Walsh & Partners, Cork",
      legalStatus: "Sale agreed at €387,500 — contracts signed, closing 12 December",
      internalNotes:
        "Buyer's mortgage approval expires in January. Stay in weekly contact with the solicitor. Do not advertise the agreed price.",
    },
  },
  {
    reference: "MAY-5012",
    slug: "cois-farraige-achill",
    status: "DRAFT",
    listingType: "SALE",
    propertyType: "SITE",
    titleEn: "Cois Farraige, Achill",
    titleEs: "Cois Farraige, Achill",
    summaryEn:
      "A 0.75-acre site with full planning permission for a contemporary four-bedroom home, 300 metres from the shore.",
    summaryEs:
      "Un solar de 0,3 hectáreas con licencia para una casa contemporánea de cuatro habitaciones, a 300 metros de la costa.",
    descriptionEn:
      "A rare opportunity to build a contemporary home on a quiet lane near Achill Sound. Full planning permission has been granted for a four-bedroom, two-storey house of approximately 220 sqm, designed to make the most of the southern aspect and sea views.\n\nServices are adjacent to the site. The village, the Greenway and the beach are all within a few minutes' drive. Draft listing — photography and final guide price to follow.",
    descriptionEs:
      "Una oportunidad poco habitual de construir una casa contemporánea en un camino tranquilo cerca de Achill Sound. Existe licencia para una vivienda de cuatro habitaciones y dos plantas de unos 220 m², diseñada para aprovechar la orientación sur y las vistas al mar.\n\nLos servicios llegan hasta el solar. El pueblo, la Greenway y la playa están a pocos minutos en coche. Anuncio en borrador: pendiente de fotografía y precio guía definitivo.",
    addressLine: "Cois Farraige, Tonregee",
    town: "Achill Sound",
    county: "Mayo",
    eircode: "F28 K2P9",
    price: 520_000,
    bedrooms: 0,
    bathrooms: 0,
    floorArea: 0,
    berRating: "",
    berNumber: "",
    yearBuilt: null,
    heating: "",
    furnished: false,
    featuresEn: [
      "0.75-acre site with sea views",
      "Full planning permission granted",
      "Design for 220 sqm home",
      "Services adjacent to site",
      "Five minutes from Achill Sound",
      "Quiet lane, 300m from the shore",
    ],
    featuresEs: [
      "Solar de 0,3 ha con vistas al mar",
      "Licencia de obra concedida",
      "Proyecto para una casa de 220 m²",
      "Servicios junto al solar",
      "A cinco minutos de Achill Sound",
      "Camino tranquilo, a 300 m de la costa",
    ],
    lat: 53.9644,
    lng: -10.0183,
    featured: false,
    publishedAt: null,
    photos: [
      { photo: "1568605114967-8130f3a36994", altEn: "Site with sea views", altEs: "Solar con vistas al mar" },
      { photo: "1600596542815-ffad4c1539a9", altEn: "Concept for the proposed house", altEs: "Concepto de la casa propuesta" },
    ],
    tours: [],
    private: {
      vendorName: "Aisling Gallagher",
      vendorPhone: "+353 87 554 1120",
      vendorEmail: "a.gallagher@example.ie",
      guidePrice: 520_000,
      commissionRate: 2,
      exclusiveUntil: new Date("2027-04-30T00:00:00Z"),
      keysLocation: "Not applicable — vacant site",
      alarmCode: "—",
      accessNotes: "Access via shared lane; please park at the road and walk up.",
      solicitor: "McGarry Solicitors, Castlebar",
      legalStatus: "Planning permission ref. 24/512 — expires 2029. Title clean.",
      internalNotes:
        "Vendor will not sell below €500k. Plans and engineer's report are in the office shared drive. Photograph on a clear day — the current image is only a placeholder.",
    },
  },
];

async function seedProperties() {
  for (const property of properties) {
    const images = property.photos.map((photo, index) => ({
      url: unsplash(photo.photo),
      altEn: photo.altEn,
      altEs: photo.altEs,
      sortOrder: index,
      isCover: index === 0,
    }));

    const tours = property.tours.map((tour, index) => ({
      type: tour.type,
      titleEn: tour.titleEn,
      titleEs: tour.titleEs,
      url: tour.url,
      sortOrder: index,
    }));

    const scalars = {
      reference: property.reference,
      slug: property.slug,
      status: property.status,
      listingType: property.listingType,
      propertyType: property.propertyType,
      titleEn: property.titleEn,
      titleEs: property.titleEs,
      summaryEn: property.summaryEn,
      summaryEs: property.summaryEs,
      descriptionEn: property.descriptionEn,
      descriptionEs: property.descriptionEs,
      addressLine: property.addressLine,
      town: property.town,
      county: property.county,
      eircode: property.eircode,
      price: property.price,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      floorArea: property.floorArea,
      berRating: property.berRating,
      berNumber: property.berNumber,
      yearBuilt: property.yearBuilt,
      heating: property.heating,
      furnished: property.furnished,
      featuresEn: property.featuresEn,
      featuresEs: property.featuresEs,
      lat: property.lat,
      lng: property.lng,
      featured: property.featured,
      publishedAt: property.publishedAt,
    };

    const existing = await prisma.property.findUnique({
      where: { reference: property.reference },
      select: { id: true },
    });

    if (existing) {
      await prisma.property.update({
        where: { id: existing.id },
        data: {
          ...scalars,
          images: { deleteMany: {}, create: images },
          tours: { deleteMany: {}, create: tours },
          private: {
            upsert: {
              create: property.private,
              update: property.private,
            },
          },
        },
      });
    } else {
      await prisma.property.create({
        data: {
          ...scalars,
          images: { create: images },
          tours: { create: tours },
          private: { create: property.private },
        },
      });
    }
  }

  console.log(`✓ ${properties.length} properties seeded`);
}

async function seedUsers() {
  const admin = await hash(ADMIN_PASSWORD, 10);
  const agent = await hash(AGENT_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { passwordHash: admin, role: "ADMIN", name: "Aoife Brennan" },
    create: {
      email: ADMIN_EMAIL,
      name: "Aoife Brennan",
      passwordHash: admin,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: AGENT_EMAIL },
    update: { passwordHash: agent, role: "AGENT", name: "Cormac Doyle" },
    create: {
      email: AGENT_EMAIL,
      name: "Cormac Doyle",
      passwordHash: agent,
      role: "AGENT",
    },
  });

  console.log(`✓ staff accounts ready (${ADMIN_EMAIL} / ${AGENT_EMAIL})`);
}

async function seedCompany() {
  await prisma.companySettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
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
    },
  });

  console.log("✓ company settings ready");
}

async function seedEnquiries() {
  const first = await prisma.property.findUnique({
    where: { reference: "DUB-1042" },
    select: { id: true },
  });
  const third = await prisma.property.findUnique({
    where: { reference: "GAL-3310" },
    select: { id: true },
  });

  const existing = await prisma.enquiry.count();
  if (existing > 0) {
    console.log("✓ enquiries already present — skipped");
    return;
  }

  await prisma.enquiry.createMany({
    data: [
      {
        propertyId: first?.id ?? null,
        name: "Sarah Kelly",
        email: "sarah.kelly@example.com",
        phone: "+353 86 301 4455",
        message:
          "We would love to view No. 3 this Saturday morning if possible. We are cash buyers and have our solicitor ready.",
        locale: "en",
        status: "NEW",
      },
      {
        propertyId: third?.id ?? null,
        name: "Laura Méndez",
        email: "laura.mendez@example.com",
        phone: "+34 655 209 118",
        message:
          "Hola, estoy interesada en el apartamento de Galway. ¿Sigue disponible para una visita la próxima semana?",
        locale: "es",
        status: "NEW",
      },
      {
        propertyId: first?.id ?? null,
        name: "Declan O'Reilly",
        email: "declan.oreilly@example.com",
        phone: "+353 87 441 2098",
        message:
          "Could you send on the floor plans and BER certificate? Also, is there scope to extend at the rear?",
        locale: "en",
        status: "CONTACTED",
        internalNote: "Plans sent 14 Oct. Follow up after the weekend.",
      },
    ],
  });

  console.log("✓ 3 enquiries seeded");
}

async function main() {
  await seedCompany();
  await seedUsers();
  await seedProperties();
  await seedEnquiries();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
