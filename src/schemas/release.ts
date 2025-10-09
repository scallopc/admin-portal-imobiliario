export type Unit = {
  id: string;
  unit?: string;
  status?: string;
  bedrooms?: number;
  parkingSpaces?: string | number;
  privateArea?: number;
  price?: number;
  source?: Record<string, any>;
  [key: string]: any;
};

export type Address = {
  city?: string;
  street?: string;
  neighborhood?: string;
};

export type Release = {
  id: string;
  title?: string;
  description?: string;
  images?: string[];
  floorPlans?: string[];
  unitsCount?: number;
  createdAt?: number;
  minUnitPrice?: number;
  address?: Address;
  developer?: string;
  units?: Unit[];
  seo: string;
  slug: string;
  status: string;
  videoUrl: string;
  virtualTourUrl: string;
  propertyType: string;
  features: string[];
  delivery?: string;

  [key: string]: any;
};
