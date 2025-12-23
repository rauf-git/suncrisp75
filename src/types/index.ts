import { LucideIcon } from 'lucide-react';

export interface Property {
  id: string;
  title: string;
  type: string;
  location: string;
  price: string;
  image: string;
  description: string;
  features: string[];
}

export interface Experience {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  image: string;
  priceStart: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface Testimonial {
  id: string;
  text: string;
  author: string;
  role: string;
}

export interface NavLink {
  label: string;
  id: string;
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

export type SectionType = 'portfolio' | 'rentals' | 'construction' | 'hospitality' | 'about' | 'contact';
