export type ListingStatus = 'available' | 'underOffer' | 'sold'
export type PropertyType = 'house' | 'apartment' | 'condo'
export type LeadStatus = 'new' | 'contacted' | 'viewing' | 'offer' | 'closed'
export type ViewingStatus = 'scheduled' | 'done' | 'cancelled'

export interface Property {
  id: string
  address: string
  area: string
  price: number // whole USD
  beds: number
  baths: number
  sqft: number
  type: PropertyType
  status: ListingStatus
  description: string
  features: string[]
}

export interface Lead {
  id: string
  name: string
  budget: number // whole USD
  area: string
  status: LeadStatus
  phone: string
}

export interface CallNote {
  at: string // ISO timestamp
  note: string
}

export interface Viewing {
  id: string
  propertyId: string
  leadId: string
  date: string // ISO date, e.g. 2026-11-23
  time: string // e.g. 10:00
  status: ViewingStatus
}

// Demo listings for a fictional agency ("Haven & Key Realty").
// Pipeline (Available + Under offer) = 685000+520000+315000+289000+425000
//   + 745000+890000 = $3,869,000 — verified by script, see README.
// Sold this month = 610000 + 975000 = $1,585,000.
export const PROPERTIES: Property[] = [
  {
    id: 'PROP-01', address: '12 Maple Grove', area: 'Riverside', price: 685000,
    beds: 4, baths: 3, sqft: 2450, type: 'house', status: 'available',
    description: 'A bright family house with a large garden, a sunny kitchen and a quiet street perfect for children.',
    features: ['Large garden', 'New kitchen', 'Double garage', 'Home office'],
  },
  {
    id: 'PROP-02', address: '48 Cedar Court', area: 'Old Town', price: 520000,
    beds: 3, baths: 2, sqft: 1780, type: 'house', status: 'available',
    description: 'A charming three-bedroom house a short walk from the old town square, cafés and the Saturday market.',
    features: ['Fireplace', 'Renovated bathroom', 'Garden shed', 'Near market'],
  },
  {
    id: 'PROP-03', address: '7 Willow Lane, Apt 4B', area: 'Downtown', price: 315000,
    beds: 2, baths: 1, sqft: 980, type: 'apartment', status: 'available',
    description: 'A light two-bedroom apartment in the heart of downtown, ideal as a first home or a city base.',
    features: ['City view', 'Lift access', 'Fitted kitchen', 'Near metro'],
  },
  {
    id: 'PROP-04', address: '210 Harbor View', area: 'Marina District', price: 745000,
    beds: 3, baths: 2, sqft: 1920, type: 'condo', status: 'underOffer',
    description: 'A modern waterfront condo with a wide balcony over the marina and evening light across the water.',
    features: ['Marina view', 'Balcony', 'Gym access', 'Secure parking'],
  },
  {
    id: 'PROP-05', address: '33 Birchwood Drive', area: 'Greenfield', price: 610000,
    beds: 4, baths: 3, sqft: 2150, type: 'house', status: 'sold',
    description: 'A spacious family home in Greenfield with a playroom, a big back garden and good schools nearby.',
    features: ['Playroom', 'Big garden', 'Near schools', 'Solar panels'],
  },
  {
    id: 'PROP-06', address: '89 Elm Street', area: 'Riverside', price: 289000,
    beds: 1, baths: 1, sqft: 720, type: 'apartment', status: 'available',
    description: 'A compact one-bedroom apartment by the river — low running costs and an easy first step onto the ladder.',
    features: ['River path nearby', 'Low running costs', 'Fitted kitchen', 'Storage room'],
  },
  {
    id: 'PROP-07', address: '156 Palm Avenue', area: 'Lakeside', price: 890000,
    beds: 5, baths: 4, sqft: 3100, type: 'house', status: 'underOffer',
    description: 'A generous five-bedroom lakeside house with a terrace, a pool and room for the whole family.',
    features: ['Lake view', 'Pool', 'Terrace', 'Guest suite'],
  },
  {
    id: 'PROP-08', address: '5 Rosewood Terrace', area: 'Old Town', price: 425000,
    beds: 2, baths: 2, sqft: 1240, type: 'condo', status: 'available',
    description: 'A stylish two-bedroom condo on a quiet terrace in Old Town, with high ceilings and a small courtyard.',
    features: ['High ceilings', 'Courtyard', 'New boiler', 'Near park'],
  },
  {
    id: 'PROP-09', address: '274 Summit Road', area: 'Hillcrest', price: 975000,
    beds: 5, baths: 4, sqft: 3450, type: 'house', status: 'sold',
    description: 'A hilltop five-bedroom house with panoramic views, a large kitchen and a garden made for summer evenings.',
    features: ['Panoramic view', 'Large kitchen', 'Garden', 'Home cinema room'],
  },
]

export const LEADS: Lead[] = [
  { id: 'LEAD-01', name: 'Sarah Mitchell', budget: 700000, area: 'Riverside', status: 'new', phone: '+1 555 0101' },
  { id: 'LEAD-02', name: 'James Carter', budget: 450000, area: 'Old Town', status: 'contacted', phone: '+1 555 0102' },
  { id: 'LEAD-03', name: 'Layla Haddad', budget: 900000, area: 'Lakeside', status: 'viewing', phone: '+1 555 0103' },
  { id: 'LEAD-04', name: 'Omar Farouk', budget: 350000, area: 'Downtown', status: 'new', phone: '+1 555 0104' },
  { id: 'LEAD-05', name: 'Emily Ross', budget: 800000, area: 'Marina District', status: 'offer', phone: '+1 555 0105' },
  { id: 'LEAD-06', name: 'David Kim', budget: 600000, area: 'Greenfield', status: 'closed', phone: '+1 555 0106' },
]

// Week shown on the calendar strip: Monday 23 – Sunday 29 November 2026.
export const WEEK_START = '2026-11-23'

export const VIEWINGS: Viewing[] = [
  { id: 'VIEW-01', propertyId: 'PROP-01', leadId: 'LEAD-01', date: '2026-11-23', time: '10:00', status: 'scheduled' },
  { id: 'VIEW-02', propertyId: 'PROP-04', leadId: 'LEAD-05', date: '2026-11-25', time: '14:00', status: 'scheduled' },
  { id: 'VIEW-03', propertyId: 'PROP-07', leadId: 'LEAD-03', date: '2026-11-27', time: '11:30', status: 'scheduled' },
  { id: 'VIEW-04', propertyId: 'PROP-02', leadId: 'LEAD-02', date: '2026-11-30', time: '15:00', status: 'scheduled' },
]

export const NEXT_LISTING_STATUS: Record<ListingStatus, ListingStatus | null> = {
  available: 'underOffer',
  underOffer: 'sold',
  sold: null,
}

export const TIME_SLOTS = ['09:00', '10:00', '11:30', '13:00', '14:00', '15:30', '17:00']

export function weekDays(startIso: string): string[] {
  const start = new Date(`${startIso}T12:00:00`)
  const out: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}
