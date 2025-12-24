import { 
  GlassWater, Trees, Sparkles, Hammer, HardHat, Ruler, Paintbrush
} from 'lucide-react';
import { Property, Experience, Service, Testimonial, NavLink } from '@/types';

export const NAV_LINKS: NavLink[] = [
  { label: 'HOME', id: 'home' },
  { label: 'PORTFOLIO', id: 'portfolio' },
  { label: 'CONSTRUCTION', id: 'construction' },
  { label: 'RENTALS', id: 'rentals' },
  { label: 'HOSPITALITY', id: 'hospitality' },
  { label: 'ABOUT US', id: 'brand-story' },
  { label: 'CONTACT', id: 'contact' },
];

export const RENTALS_DATA: Property[] = [
  {
    id: 'r1',
    title: 'The Azure Villa',
    type: 'Residential',
    location: 'Malibu, California',
    price: '$12,500,000',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
    description: 'A masterpiece of coastal modernism, perched above the Pacific with panoramic ocean views and private beach access.',
    features: ['5 Beds, 6 Baths', 'Infinity Pool', 'Private Cinema', 'Smart Home Integration']
  },
  {
    id: 'r2',
    title: 'Penthouse 57',
    type: 'Residential',
    location: 'Manhattan, New York',
    price: '$28,000,000',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
    description: 'Floating above the city skyline, this triplex penthouse offers Central Park views and bespoke interiors by renowned designers.',
    features: ['6,000 sq ft', 'Private Elevator', 'Wraparound Terrace', 'Wine Cellar']
  },
  {
    id: 'r3',
    title: 'The Meridian Estate',
    type: 'Residential',
    location: 'Beverly Hills, California',
    price: '$45,000,000',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
    description: 'An iconic estate blending classic architecture with contemporary luxury, set on 3 acres of manicured grounds.',
    features: ['8 Beds, 12 Baths', 'Tennis Court', 'Guest House', 'Vineyard']
  }
];

export const PORTFOLIO_DATA: Property[] = [
  {
    id: 'p1',
    title: 'Skyline Hotel Renovation',
    type: 'Commercial',
    location: 'Chicago, IL',
    price: 'Completed 2023',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
    description: 'Full structural renovation and interior redesign of a historic 40-story hotel downtown.',
    features: ['Structural Reinforcement', 'Interior Design', 'HVAC Overhaul', 'LEED Certified']
  },
  {
    id: 'p2',
    title: 'Seaside Resort Development',
    type: 'Development',
    location: 'Cabo, Mexico',
    price: 'Completed 2022',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop',
    description: 'Ground-up construction of a 5-star luxury resort including 50 private villas and a marina.',
    features: ['Land Development', 'Civil Engineering', 'Landscape Architecture', 'Sustainable Build']
  },
  {
    id: 'p3',
    title: 'Urban Loft Conversion',
    type: 'Residential',
    location: 'Brooklyn, NY',
    price: 'Completed 2024',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
    description: 'Adaptive reuse project transforming an industrial warehouse into luxury loft apartments.',
    features: ['Adaptive Reuse', 'Historic Preservation', 'Modern Amenities', 'Rooftop Gardens']
  }
];

export const HOSPITALITY_DATA: Experience[] = [
  {
    id: 'h1',
    title: 'Oasis Desert Retreat',
    description: 'An exclusive sanctuary in the Arabian dunes, featuring tented pool villas and world-class spa facilities.',
    icon: Trees,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=800&fit=crop',
    priceStart: 'From $2,400/night'
  },
  {
    id: 'h2',
    title: 'Ubud Jungle Estate',
    description: 'Suspended among the treetops, this eco-luxury resort blends seamless indoor-outdoor living with spiritual tranquility.',
    icon: GlassWater,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=800&fit=crop',
    priceStart: 'From $1,800/night'
  },
  {
    id: 'h3',
    title: 'Alpine Chalet Collection',
    description: 'Premium ski-in/ski-out chalets offering private chefs and curated winter experiences.',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=600&h=800&fit=crop',
    priceStart: 'From $5,000/night'
  }
];

export const CONSTRUCTION_SERVICES: Service[] = [
  {
    id: 'c1',
    title: 'General Contracting',
    description: 'Comprehensive construction management for commercial and ultra-luxury residential projects.',
    icon: HardHat
  },
  {
    id: 'c2',
    title: 'Architectural Design',
    description: 'Award-winning design team creating visionary blueprints that merge aesthetics with functionality.',
    icon: Ruler
  },
  {
    id: 'c3',
    title: 'Renovation & Restoration',
    description: 'Breathing new life into existing structures with meticulous attention to detail and heritage.',
    icon: Hammer
  },
  {
    id: 'c4',
    title: 'Interior Finishing',
    description: 'High-end custom joinery, flooring, and finishing services for the most demanding interiors.',
    icon: Paintbrush
  }
];

export const TESTIMONIALS: Testimonial[] = [
  { id: 't1', text: "Suncrisp delivered our resort project ahead of schedule and under budget. Their commitment to excellence is unmatched.", author: "Marcus V.", role: "Developer" },
  { id: 't2', text: "The attention to detail in their hospitality management is impeccable. Every stay feels like a curated experience.", author: "Elena R.", role: "Guest" },
  { id: 't3', text: "Our custom villa was built to perfection. Truly world-class construction with remarkable craftsmanship.", author: "Ahmed A.", role: "Homeowner" },
];

export const PRESS_LOGOS = [
  "Architectural Digest", "Forbes", "Construction Week", "Travel + Leisure", "The Real Deal", "Robb Report"
];
