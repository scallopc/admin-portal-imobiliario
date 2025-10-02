export type Address = {
  city?: string;
  street?: string;
  neighborhood?: string;
  number?: string;
  state?: string;
  zipCode?: string;
  country?: string;
};

export type Property = {
  title: string,
  slug: string,
  description: string,
  propertyType: string,
  layout: string,
  status: string,
  price: number,
  currency: string,
  totalArea: number,
  privateArea: number,
  usefulArea: number,
  bedrooms: number,
  bathrooms: number,
  suites: number,
  suiteDetails: string,
  parkingSpaces: number,
  address: Address,
  features: string[],
  images: string[],
  floorPlans: string[],
  videoUrl: string,
  virtualTourUrl: string,
  seo: string,
}
