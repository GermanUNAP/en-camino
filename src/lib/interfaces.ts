// En tu archivo src/lib/interfaces.ts
export enum PlanTypeEnum {
  FREEMIUM = "freemium",
  CRECE = "crece",
  PRO_PLUS = "pro+",
  EMPRESA = "empresa", // Represents both "Empresa" and "Publicidad Empresarial" plans internally
}

export interface ProductDataBase {
  name: string;
  description?: string;
  price: number;
  images: string[];
  isFeatured?: boolean;
}

export interface ProductData extends ProductDataBase {
  storeId: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string; // Consider if this is redundant if 'images' array already contains URLs
  images: string[];
}

export interface SocialMediaLink {
  platform: string;
  link: string;
}

export interface Payment {
  planType: PlanTypeEnum; // Usamos el enum
  amount: number;
  paymentDate: string; 
  endDate: string; 
  transactionId?: string;
  discountAppliedForWeeks?: number;
}

export interface PlanDefinition {
  name: string; // "Freemium", "Crece", "Pro+", "Publicidad Empresarial" (el nombre visible)
  weeklyCost: number;
  description: string[];
  planType: PlanTypeEnum; // El tipo de plan interno
}

export interface SubscriptionPlan {
  planType: PlanTypeEnum; // Usamos el enum
  startDate: string; 
  endDate: string; 
  isActive: boolean;
  discountEndDate?: string; 
}


export interface Store {
  id?: string;
  userId: string;
  name: string;
  category: string;
  description?: string;
  city?: string;
  address: string;
  phone?: string;
  coverImage?: string; // URL de la imagen principal
  tags: string[];
  storeImages?: string[]; // URLs de todas las imágenes de portada/galería
  products?: Product[];
  socialMedia?: SocialMediaLink[];
  latitude?: number;
  longitude?: number;
  stars?: number;
  views?: number;
  clicks?: number;
  whatsappClicks?: number;
  productSells?: number;
  followers?: number;
  opinionsCount?: number;
  webClicks?: number;

  currentPlan: SubscriptionPlan;
  paymentHistory: Payment[];
}