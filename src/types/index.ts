import { LucideIcon } from 'lucide-react';

export type SectionType = 'portfolio' | 'construction' | 'rentals' | 'hospitality' | 'about' | 'contact';

export interface Property {
  id: string;
  title: string;
  type: string;
  location: string;
  price: string;
  image: string;
  description: string;
  detailedDescription?: string;
  gallery?: string[];
  features: string[];
}

export interface Experience {
  id: string;
  title: string;
  description: string;
  detailedDescription?: string;
  image: string;
  priceStart: string;
  icon?: LucideIcon;
  gallery?: string[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  detailedDescription?: string;
  icon?: LucideIcon;
  gallery?: string[];
}

export interface Testimonial {
  id: string;
  text: string;
  author: string;
  role: string;
}

export interface NavLink {
  id: string;
  label: string;
}

export interface AboutData {
  title: string;
  description: string;
  image: string;
}

export interface ContactData {
  email: string;
  phone: string;
  address: string;
  mapUrl: string;
}
