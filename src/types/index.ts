export interface Property {
  id: string;
  title: string;
  description: string;
  type: "house" | "apartment" | "land" | "commercial";
  status: "for_sale" | "for_rent";
  price: number;
  currency: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  code: string;
  parkingSpaces: number;
  furnished: boolean;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  features: string[];
  images: string[];
  videos?: string[];
  createdAt: Date;
  updatedAt: Date;
  listedBy: string;
}

export interface SearchFilters {
  query?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  city?: string;
  neighborhood?: string;
}

export type PipelineStage =
  | "novo"
  | "qualificacao"
  | "contato-feito"
  | "visita-marcada"
  | "proposta"
  | "negociacao"
  | "ganho"
  | "perdido";

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  stage: PipelineStage;
  assignedTo?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Deal {
  id: string;
  leadId: string;
  propertyId?: string;
  title: string;
  amount?: number;
  stage: PipelineStage;
  closeDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
