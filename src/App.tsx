import { useEffect, useMemo, useState } from 'react'
import {
  ArrowsClockwise,
  ArrowRight,
  Bathtub,
  Bed,
  Buildings,
  CalendarBlank,
  ChartBar,
  Check,
  CurrencyDollar,
  GlobeHemisphereWest,
  House,
  Key,
  MagnifyingGlass,
  MapPin,
  PhoneCall,
  Plus,
  Ruler,
  Users,
  X,
} from '@phosphor-icons/react'
import { detectLang, useDict, type Lang } from './i18n'
import {
  LEADS,
  NEXT_LISTING_STATUS,
  PROPERTIES,
  TIME_SLOTS,
  VIEWINGS,
  WEEK_START,
  weekDays,
  type CallNote,
  type Lead,
  type LeadStatus,
  type ListingStatus,
  type Property,
  type PropertyType,
  type Viewing,
} from './data/realestate'

const LANG_KEY = 'real-estate-crm-lang'
const STATUS_KEY = 'real-estate-crm-status'
const LISTINGS_KEY = 'real-estate-crm-listings'
const LEAD_STATUS_KEY = 'real-estate-crm-lead-status'
const LEADS_KEY = 'real-estate-crm-leads'
const CALLS_KEY = 'real-estate-crm-calls'
const VIEWINGS_KEY = 'real-estate-crm-viewings'

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function saveJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage unavailable
  }
}

const STATUS_STYLE: Record<ListingStatus, string> = {
  available: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  underOffer: 'bg-amber-100 text-amber-800 ring-amber-200',
  sold: 'bg-slate-200 text-slate-700 ring-slate-300',
}

const LEAD_STATUS_STYLE: Record<LeadStatus, string> = {
  new: 'bg-sky-100 text-sky-800 ring-sky-200',
  contacted: 'bg-violet-100 text-violet-800 ring-violet-200',
  viewing: 'bg-amber-100 text-amber-800 ring-amber-200',
  offer: 'bg-orange-100 text-orange-800 ring-orange-200',
  closed: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
}

const GRADIENTS = [
  'from-orange-400 to-rose-500',
  'from-amber-400 to-orange-500',
  'from-teal-400 to-emerald-600',
  'from-sky-400 to-indigo-500',
  'from-rose-400 to-amber-500',
  'from-emerald-400 to-teal-600',
  'from-violet-400 to-purple-600',
  'from-yellow-400 to-orange-500',
  'from-cyan-400 to-sky-600',
]

const TYPE_ICON: Record<PropertyType, typeof House> = {
  house: House,
  apartment: Buildings,
  condo: Key,
}

type StatusFilter = 'all' | ListingStatus
type TypeFilter = 'all' | PropertyType

export default function App() {
  const [lang, setLang] = useState<Lang>(() => detectLang())
  const { t } = useDict(lang)

  const [statusOverrides, setStatusOverrides] = useState<Record<string, ListingStatus>>(() =>
    loadJson(STATUS_KEY, {}),
  )
  const [addedListings, setAddedListings] = useState<Property[]>(() => loadJson(LISTINGS_KEY, []))
  const [leadStatusOverrides, setLeadStatusOverrides] = useState<Record<string, LeadStatus>>(() =>
    loadJson(LEAD_STATUS_KEY, {}),
  )
  const [addedLeads, setAddedLeads] = useState<Lead[]>(() => loadJson(LEADS_KEY, []))
  const [callLogs, setCallLogs] = useState<Record<string, CallNote[]>>(() => loadJson(CALLS_KEY, {}))
  const [viewings, setViewings] = useState<Viewing[]>(() => loadJson(VIEWINGS_KEY, VIEWINGS))

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [activeNav, setActiveNav] = useState('dashboard')

  // Booking form
  const [bookProperty, setBookProperty] = useState(PROPERTIES[0].id)
  const [bookLead, setBookLead] = useState(LEADS[0].id)
  const [bookDate, setBookDate] = useState('2026-11-28')
  const [bookTime, setBookTime] = useState('10:00')
  const [bookError, setBookError] = useState(false)

  // Add-listing form
  const [newAddress, setNewAddress] = useState('')
  const [newArea, setNewArea] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newBeds, setNewBeds] = useState('')
  const [newBaths, setNewBaths] = useState('')
  const [newType, setNewType] = useState<PropertyType>('house')
  const [listingError, setListingError] = useState(false)

  // Add-lead form
  const [newLeadName, setNewLeadName] = useState('')
  const [newLeadBudget, setNewLeadBudget] = useState('')
  const [newLeadArea, setNewLeadArea] = useState('')
  const [leadError, setLeadError] = useState(false)

  // Call-note input (for the selected lead)
  const [callNote, setCallNote] = useState('')

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    try {
      localStorage.setItem(LANG_KEY, lang)
    } catch {
      // storage unavailable
    }
  }, [lang])
  useEffect(() => saveJson(STATUS_KEY, statusOverrides), [statusOverrides])
  useEffect(() => saveJson(LISTINGS_KEY, addedListings), [addedListings])
  useEffect(() => saveJson(LEAD_STATUS_KEY, leadStatusOverrides), [leadStatusOverrides])
  useEffect(() => saveJson(LEADS_KEY, addedLeads), [addedLeads])
  useEffect(() => saveJson(CALLS_KEY, callLogs), [callLogs])
  useEffect(() => saveJson(VIEWINGS_KEY, viewings), [viewings])

  const listings = useMemo(
    () =>
      [...PROPERTIES, ...addedListings].map((p) =>
        statusOverrides[p.id] ? { ...p, status: statusOverrides[p.id] } : p,
      ),
    [statusOverrides, addedListings],
  )
  const leads = useMemo(
    () =>
      [...LEADS, ...addedLeads].map((l) =>
        leadStatusOverrides[l.id] ? { ...l, status: leadStatusOverrides[l.id] } : l,
      ),
    [leadStatusOverrides, addedLeads],
  )

  const fmt = (n: number) =>
    new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n)

  // ---- Live-computed figures ----
  const pipelineValue = useMemo(
    () =>
      listings
        .filter((p) => p.status === 'available' || p.status === 'underOffer')
        .reduce((s, p) => s + p.price, 0),
    [listings],
  )
  const availableValue = useMemo(
    () => listings.filter((p) => p.status === 'available').reduce((s, p) => s + p.price, 0),
    [listings],
  )
  const underOfferValue = useMemo(
    () => listings.filter((p) => p.status === 'underOffer').reduce((s, p) => s + p.price, 0),
    [listings],
  )
  const soldValue = useMemo(
    () => listings.filter((p) => p.status === 'sold').reduce((s, p) => s + p.price, 0),
    [listings],
  )
  const activeLeads = useMemo(() => leads.filter((l) => l.status !== 'closed'), [leads])
  const week = useMemo(() => weekDays(WEEK_START), [])
  const viewingsThisWeek = useMemo(
    () =>
      viewings.filter(
        (v) => v.status === 'scheduled' && week.includes(v.date),
      ).length,
    [viewings, week],
  )
  const totalValue = Math.max(pipelineValue + soldValue, 1)

  const filteredListings = useMemo(() => {
    const q = search.trim().toLowerCase()
    const min = minPrice === '' ? 0 : Number(minPrice)
    const max = maxPrice === '' ? Infinity : Number(maxPrice)
    return listings.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (typeFilter !== 'all' && p.type !== typeFilter) return false
      if (p.price < min || p.price > max) return false
      if (q && !`${p.address} ${p.area}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [listings, search, statusFilter, typeFilter, minPrice, maxPrice])

  const selectedProperty = listings.find((p) => p.id === selectedPropertyId) ?? null
  const selectedLead = leads.find((l) => l.id === selectedLeadId) ?? null
  const propertyViewings = (id: string) => viewings.filter((v) => v.propertyId === id && v.status !== 'cancelled')
  const leadName = (id: string) => leads.find((l) => l.id === id)?.name ?? id
  const propertyLabel = (id: string) => {
    const p = listings.find((x) => x.id === id)
    return p ? `${p.address}, ${p.area}` : id
  }

  const advanceListing = (id: string) => {
    const cur = listings.find((p) => p.id === id)?.status ?? 'available'
    const next = NEXT_LISTING_STATUS[cur]
    if (next) setStatusOverrides((prev) => ({ ...prev, [id]: next }))
  }

  const logCall = (leadId: string) => {
    const note = callNote.trim()
    if (!note) return
    const entry: CallNote = { at: new Date().toISOString(), note }
    setCallLogs((prev) => ({ ...prev, [leadId]: [...(prev[leadId] ?? []), entry] }))
    setCallNote('')
    const cur = leads.find((l) => l.id === leadId)?.status ?? 'new'
    if (cur !== 'offer' && cur !== 'closed') {
      setLeadStatusOverrides((prev) => ({ ...prev, [leadId]: 'contacted' }))
    }
  }

  const bookViewing = () => {
    if (!bookProperty || !bookLead || !bookDate || !bookTime) {
      setBookError(true)
      return
    }
    setBookError(false)
    const id = `VIEW-${String(viewings.length + 1).padStart(2, '0')}-${Date.now().toString(36)}`
    setViewings((prev) => [
      ...prev,
      { id, propertyId: bookProperty, leadId: bookLead, date: bookDate, time: bookTime, status: 'scheduled' },
    ])
    // A booked viewing moves the lead toward the viewing stage.
    const cur = leads.find((l) => l.id === bookLead)?.status ?? 'new'
    if (cur === 'new' || cur === 'contacted') {
      setLeadStatusOverrides((prev) => ({ ...prev, [bookLead]: 'viewing' }))
    }
  }

  const cancelViewing = (id: string) =>
    setViewings((prev) => prev.map((v) => (v.id === id ? { ...v, status: 'cancelled' } : v)))

  const completeViewing = (id: string) => {
    const v = viewings.find((x) => x.id === id)
    if (!v) return
    setViewings((prev) => prev.map((x) => (x.id === id ? { ...x, status: 'done' } : x)))
    const cur = leads.find((l) => l.id === v.leadId)?.status ?? 'new'
    if (cur !== 'offer' && cur !== 'closed') {
      setLeadStatusOverrides((prev) => ({ ...prev, [v.leadId]: 'offer' }))
    }
  }

  const addListing = () => {
    const address = newAddress.trim()
    const area = newArea.trim() || 'Downtown'
    const price = Math.round(Number(newPrice))
    const beds = Math.floor(Number(newBeds))
    const baths = Math.floor(Number(newBaths))
    if (!address || !Number.isFinite(price) || price <= 0 || !Number.isFinite(beds) || beds < 0 || !Number.isFinite(baths) || baths < 0) {
      setListingError(true)
      return
    }
    setListingError(false)
    const id = `PROP-${String(PROPERTIES.length + addedListings.length + 1).padStart(2, '0')}`
    setAddedListings((prev) => [
      ...prev,
      {
        id, address, area, price, beds, baths,
        sqft: beds * 450 + 400,
        type: newType, status: 'available',
        description: 'A newly added listing — ask the agent for full details and photos.',
        features: ['New listing'],
      },
    ])
    setNewAddress('')
    setNewArea('')
    setNewPrice('')
    setNewBeds('')
    setNewBaths('')
  }

  const addLead = () => {
    const name = newLeadName.trim()
    const budget = Math.round(Number(newLeadBudget))
    const area = newLeadArea.trim()
    if (!name || !Number.isFinite(budget) || budget <= 0 || !area) {
      setLeadError(true)
      return
    }
    setLeadError(false)
    const id = `LEAD-${String(LEADS.length + addedLeads.length + 1).padStart(2, '0')}`
    setAddedLeads((prev) => [...prev, { id, name, budget, area, status: 'new', phone: '' }])
    setNewLeadName('')
    setNewLeadBudget('')
    setNewLeadArea('')
  }

  const resetDemo = () => {
    setStatusOverrides({})
    setAddedListings([])
    setLeadStatusOverrides({})
    setAddedLeads([])
    setCallLogs({})
    setViewings(VIEWINGS)
    setSelectedPropertyId(null)
    setSelectedLeadId(null)
    setSearch('')
    setStatusFilter('all')
    setTypeFilter('all')
    setMinPrice('')
    setMaxPrice('')
    for (const k of [STATUS_KEY, LISTINGS_KEY, LEAD_STATUS_KEY, LEADS_KEY, CALLS_KEY, VIEWINGS_KEY]) {
      try {
        localStorage.removeItem(k)
      } catch {
        // storage unavailable
      }
    }
  }

  const dayLabel = (iso: string) =>
    new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short' }).format(
      new Date(`${iso}T12:00:00`),
    )
  const dayNum = (iso: string) => new Date(`${iso}T12:00:00`).getDate()

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: ChartBar, href: '#top' },
    { id: 'listings', label: t('nav.listings'), icon: House, href: '#listings' },
    { id: 'leads', label: t('nav.leads'), icon: Users, href: '#leads' },
    { id: 'viewings', label: t('nav.viewings'), icon: CalendarBlank, href: '#viewings' },
  ]

  const inputCls =
    'w-full rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-600'

  return (
    <div id="top" className="min-h-screen bg-orange-50 text-stone-900">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Sidebar */}
        <aside className="sticky top-6 hidden h-fit w-60 shrink-0 flex-col gap-1 rounded-2xl bg-stone-900 p-4 text-white md:flex">
          <div className="mb-4 flex items-center gap-3 px-2 pt-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500">
              <Key size={22} weight="bold" />
            </span>
            <div>
              <p className="text-lg font-extrabold leading-tight">{t('app.name')}</p>
              <p className="text-xs text-orange-300">{t('app.agency')}</p>
            </div>
          </div>
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={() => setActiveNav(item.id)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                activeNav === item.id ? 'bg-stone-700 text-white' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </a>
          ))}
          <div className="mt-6 rounded-xl bg-stone-800 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-300">{t('stats.pipeline')}</p>
            <p className="mt-1 text-2xl font-extrabold">{fmt(pipelineValue)}</p>
            <p className="mt-1 text-xs text-stone-300">{t('stats.pipelineSub')}</p>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-orange-700">
                {t('header.greeting')}, {t('app.agency')}
              </p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{t('header.title')}</h1>
              <p className="mt-1 text-sm text-stone-500">{t('header.subtitle')}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold shadow-sm ring-1 ring-stone-200 hover:bg-stone-50"
              >
                <GlobeHemisphereWest size={18} />
                {lang === 'en' ? 'العربية' : 'English'}
              </button>
              <button
                type="button"
                onClick={resetDemo}
                className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold shadow-sm ring-1 ring-stone-200 hover:bg-stone-50"
              >
                <ArrowsClockwise size={18} />
                {t('actions.reset')}
              </button>
            </div>
          </header>

          {/* Stats */}
          <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
            <div className="col-span-2 rounded-2xl bg-orange-600 p-5 text-white shadow-sm lg:col-span-1">
              <div className="flex items-center gap-2 text-orange-100">
                <CurrencyDollar size={18} />
                <p className="text-sm font-semibold">{t('stats.pipeline')}</p>
              </div>
              <p className="mt-2 text-2xl font-extrabold">{fmt(pipelineValue)}</p>
              <p className="mt-1 text-xs text-orange-100">{t('stats.pipelineSub')}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
              <div className="flex items-center gap-2 text-stone-500">
                <House size={18} />
                <p className="text-sm font-semibold">{t('stats.listings')}</p>
              </div>
              <p className="mt-2 text-3xl font-extrabold">{listings.length}</p>
              <p className="mt-1 text-xs text-stone-500">{t('stats.listingsSub')}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
              <div className="flex items-center gap-2 text-stone-500">
                <Check size={18} />
                <p className="text-sm font-semibold">{t('stats.soldMonth')}</p>
              </div>
              <p className="mt-2 text-2xl font-extrabold">{fmt(soldValue)}</p>
              <p className="mt-1 text-xs text-stone-500">{t('stats.soldMonthSub')}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
              <div className="flex items-center gap-2 text-stone-500">
                <Users size={18} />
                <p className="text-sm font-semibold">{t('stats.activeLeads')}</p>
              </div>
              <p className="mt-2 text-3xl font-extrabold">{activeLeads.length}</p>
              <p className="mt-1 text-xs text-stone-500">{t('stats.activeLeadsSub')}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
              <div className="flex items-center gap-2 text-stone-500">
                <CalendarBlank size={18} />
                <p className="text-sm font-semibold">{t('stats.viewingsWeek')}</p>
              </div>
              <p className="mt-2 text-3xl font-extrabold">{viewingsThisWeek}</p>
              <p className="mt-1 text-xs text-stone-500">{t('stats.viewingsWeekSub')}</p>
            </div>
          </section>

          {/* Pipeline split */}
          <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
            <h2 className="text-lg font-extrabold">{t('stats.pipeline')}</h2>
            <div className="mt-4 flex h-4 w-full overflow-hidden rounded-full bg-stone-100">
              <div className="h-full bg-emerald-500" style={{ width: `${(availableValue / totalValue) * 100}%` }} />
              <div className="h-full bg-amber-500" style={{ width: `${(underOfferValue / totalValue) * 100}%` }} />
              <div className="h-full bg-slate-400" style={{ width: `${(soldValue / totalValue) * 100}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                {t('stats.available')}: {fmt(availableValue)}
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-500" />
                {t('stats.underOffer')}: {fmt(underOfferValue)}
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-slate-400" />
                {t('stats.sold')}: {fmt(soldValue)}
              </span>
            </div>
          </section>

          {/* Listings */}
          <section id="listings" className="mt-6 scroll-mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
            <div className="flex items-center gap-2">
              <House size={20} className="text-orange-700" />
              <h2 className="text-lg font-extrabold">{t('listings.title')}</h2>
            </div>
            <p className="mt-1 text-sm text-stone-500">{t('listings.subtitle')}</p>

            {/* Filters */}
            <div className="mt-4 flex flex-wrap gap-3">
              <label className="relative min-w-52 flex-1">
                <MagnifyingGlass size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('listings.searchPlaceholder')}
                  className={`${inputCls} ps-9`}
                />
              </label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className={`${inputCls} w-auto`}>
                <option value="all">{t('listings.statusAll')}</option>
                <option value="available">{t('listings.statusAvailable')}</option>
                <option value="underOffer">{t('listings.statusUnderOffer')}</option>
                <option value="sold">{t('listings.statusSold')}</option>
              </select>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TypeFilter)} className={`${inputCls} w-auto`}>
                <option value="all">{t('listings.typeAll')}</option>
                <option value="house">{t('listings.typeHouse')}</option>
                <option value="apartment">{t('listings.typeApartment')}</option>
                <option value="condo">{t('listings.typeCondo')}</option>
              </select>
              <input
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                inputMode="numeric"
                placeholder={t('listings.minPrice')}
                className={`${inputCls} w-32`}
              />
              <input
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                inputMode="numeric"
                placeholder={t('listings.maxPrice')}
                className={`${inputCls} w-32`}
              />
            </div>

            {filteredListings.length === 0 ? (
              <p className="mt-6 rounded-xl bg-stone-50 px-4 py-6 text-center text-sm font-semibold text-stone-500">
                {t('listings.noResults')}
              </p>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredListings.map((p, i) => {
                  const Icon = TYPE_ICON[p.type]
                  const next = NEXT_LISTING_STATUS[p.status]
                  return (
                    <article
                      key={p.id}
                      className={`overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200 transition-shadow hover:shadow-md ${
                        selectedPropertyId === p.id ? 'ring-2 ring-orange-600' : ''
                      }`}
                    >
                      <button type="button" onClick={() => setSelectedPropertyId(p.id)} className="block w-full text-start">
                        <div className={`flex h-32 items-center justify-center bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}`}>
                          <Icon size={56} weight="duotone" className="text-white/90" />
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xl font-extrabold">{fmt(p.price)}</p>
                            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${STATUS_STYLE[p.status]}`}>
                              {t(`listings.status${p.status === 'underOffer' ? 'UnderOffer' : p.status === 'available' ? 'Available' : 'Sold'}`)}
                            </span>
                          </div>
                          <p className="mt-1 flex items-center gap-1 text-sm font-bold">
                            <MapPin size={14} className="text-orange-600" />
                            {p.address}, {p.area}
                          </p>
                          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-stone-500">
                            <span className="flex items-center gap-1"><Bed size={14} /> {p.beds} {t('listings.beds')}</span>
                            <span className="flex items-center gap-1"><Bathtub size={14} /> {p.baths} {t('listings.baths')}</span>
                            <span className="flex items-center gap-1"><Ruler size={14} /> {p.sqft.toLocaleString()} {t('listings.sqft')}</span>
                            <span>{t(`listings.type${p.type === 'house' ? 'House' : p.type === 'apartment' ? 'Apartment' : 'Condo'}`)}</span>
                          </p>
                        </div>
                      </button>
                      <div className="flex gap-2 px-4 pb-4">
                        <button
                          type="button"
                          onClick={() => setSelectedPropertyId(p.id)}
                          className="flex-1 rounded-lg bg-stone-900 px-3 py-2 text-xs font-bold text-white hover:bg-stone-700"
                        >
                          {t('listings.viewDetails')}
                        </button>
                        {next && (
                          <button
                            type="button"
                            onClick={() => advanceListing(p.id)}
                            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-orange-600 px-3 py-2 text-xs font-bold text-white hover:bg-orange-700"
                          >
                            {t('listings.advance')}
                            <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}

            {/* Property detail panel */}
            {selectedProperty && (
              <div className="mt-6 rounded-2xl bg-orange-50 p-5 ring-1 ring-orange-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-extrabold">
                      {t('listings.details')}: {selectedProperty.address}, {selectedProperty.area}
                    </h3>
                    <p className="mt-1 text-xl font-extrabold text-orange-700">{fmt(selectedProperty.price)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPropertyId(null)}
                    aria-label="Close"
                    className="rounded-full bg-white p-2 ring-1 ring-stone-200 hover:bg-stone-50"
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className="mt-3 text-sm text-stone-600">{selectedProperty.description}</p>
                <h4 className="mt-4 text-sm font-extrabold">{t('listings.features')}</h4>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {selectedProperty.features.map((f) => (
                    <li key={f} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-stone-700 ring-1 ring-stone-200">
                      {f}
                    </li>
                  ))}
                </ul>
                <h4 className="mt-4 text-sm font-extrabold">{t('listings.viewingsFor')}</h4>
                {propertyViewings(selectedProperty.id).length === 0 ? (
                  <p className="mt-1 text-sm text-stone-500">{t('listings.noViewings')}</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {propertyViewings(selectedProperty.id).map((v) => (
                      <li key={v.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-stone-200">
                        <CalendarBlank size={16} className="text-orange-600" />
                        <span className="font-bold">{v.date} · {v.time}</span>
                        <span>{leadName(v.leadId)}</span>
                        <span className="text-xs font-bold text-stone-500">
                          {v.status === 'done' ? t('viewings.done') : t('viewings.scheduled')}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Add listing */}
            <div className="mt-6 rounded-xl bg-stone-50 p-4 ring-1 ring-stone-200">
              <h3 className="text-sm font-extrabold">{t('listings.addTitle')}</h3>
              <p className="mt-0.5 text-xs text-stone-500">{t('listings.addSubtitle')}</p>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <label className="min-w-44 flex-1">
                  <span className="mb-1 block text-xs font-bold text-stone-600">{t('listings.addressLabel')}</span>
                  <input value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder="12 New Street" className={inputCls} />
                </label>
                <label className="w-36">
                  <span className="mb-1 block text-xs font-bold text-stone-600">{t('leads.area')}</span>
                  <input value={newArea} onChange={(e) => setNewArea(e.target.value)} placeholder="Riverside" className={inputCls} />
                </label>
                <label className="w-32">
                  <span className="mb-1 block text-xs font-bold text-stone-600">{t('listings.priceLabel')}</span>
                  <input value={newPrice} onChange={(e) => setNewPrice(e.target.value)} inputMode="numeric" placeholder="450000" className={inputCls} />
                </label>
                <label className="w-20">
                  <span className="mb-1 block text-xs font-bold text-stone-600">{t('listings.bedsLabel')}</span>
                  <input value={newBeds} onChange={(e) => setNewBeds(e.target.value)} inputMode="numeric" placeholder="3" className={inputCls} />
                </label>
                <label className="w-20">
                  <span className="mb-1 block text-xs font-bold text-stone-600">{t('listings.bathsLabel')}</span>
                  <input value={newBaths} onChange={(e) => setNewBaths(e.target.value)} inputMode="numeric" placeholder="2" className={inputCls} />
                </label>
                <label className="w-32">
                  <span className="mb-1 block text-xs font-bold text-stone-600">{t('listings.typeLabel')}</span>
                  <select value={newType} onChange={(e) => setNewType(e.target.value as PropertyType)} className={inputCls}>
                    <option value="house">{t('listings.typeHouse')}</option>
                    <option value="apartment">{t('listings.typeApartment')}</option>
                    <option value="condo">{t('listings.typeCondo')}</option>
                  </select>
                </label>
                <button
                  type="button"
                  onClick={addListing}
                  className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700"
                >
                  <Plus size={16} weight="bold" />
                  {t('listings.addButton')}
                </button>
              </div>
              {listingError && <p className="mt-2 text-xs font-bold text-rose-700">{t('listings.addError')}</p>}
            </div>
          </section>

          {/* Leads */}
          <section id="leads" className="mt-6 scroll-mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-orange-700" />
              <h2 className="text-lg font-extrabold">{t('leads.title')}</h2>
            </div>
            <p className="mt-1 text-sm text-stone-500">{t('leads.subtitle')}</p>
            <ul className="mt-5 divide-y divide-stone-100">
              {leads.map((l) => (
                <li key={l.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-extrabold text-orange-800">
                      {l.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold">{l.name}</p>
                      <p className="text-xs text-stone-500">
                        {t('leads.budget')}: {fmt(l.budget)} · {t('leads.area')}: {l.area}
                        {l.phone ? ` · ${l.phone}` : ''}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${LEAD_STATUS_STYLE[l.status]}`}>
                      {t(`leads.status${l.status === 'new' ? 'New' : l.status === 'contacted' ? 'Contacted' : l.status === 'viewing' ? 'Viewing' : l.status === 'offer' ? 'Offer' : 'Closed'}`)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedLeadId(selectedLeadId === l.id ? null : l.id)}
                      className="flex items-center gap-1 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-stone-700"
                    >
                      <PhoneCall size={14} />
                      {t('leads.logCall')}
                    </button>
                  </div>
                  {selectedLeadId === l.id && selectedLead && (
                    <div className="mt-3 rounded-xl bg-stone-50 p-4 ring-1 ring-stone-200">
                      <h4 className="text-sm font-extrabold">{t('leads.activity')}</h4>
                      {(callLogs[l.id] ?? []).length === 0 ? (
                        <p className="mt-1 text-xs text-stone-500">{t('leads.noActivity')}</p>
                      ) : (
                        <ul className="mt-2 space-y-2">
                          {(callLogs[l.id] ?? []).map((c, i) => (
                            <li key={`${c.at}-${i}`} className="rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-stone-200">
                              <p className="text-xs font-bold text-stone-500">
                                {new Date(c.at).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                              </p>
                              <p className="mt-0.5">{c.note}</p>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <input
                          value={callNote}
                          onChange={(e) => setCallNote(e.target.value)}
                          placeholder={t('leads.callPlaceholder')}
                          className={`${inputCls} min-w-52 flex-1`}
                        />
                        <button
                          type="button"
                          onClick={() => logCall(l.id)}
                          className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700"
                        >
                          <PhoneCall size={16} />
                          {t('leads.callButton')}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {/* Add lead */}
            <div className="mt-6 rounded-xl bg-stone-50 p-4 ring-1 ring-stone-200">
              <h3 className="text-sm font-extrabold">{t('leads.addTitle')}</h3>
              <p className="mt-0.5 text-xs text-stone-500">{t('leads.addSubtitle')}</p>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <label className="min-w-44 flex-1">
                  <span className="mb-1 block text-xs font-bold text-stone-600">{t('leads.nameLabel')}</span>
                  <input value={newLeadName} onChange={(e) => setNewLeadName(e.target.value)} placeholder="Alex Morgan" className={inputCls} />
                </label>
                <label className="w-36">
                  <span className="mb-1 block text-xs font-bold text-stone-600">{t('leads.budgetLabel')}</span>
                  <input value={newLeadBudget} onChange={(e) => setNewLeadBudget(e.target.value)} inputMode="numeric" placeholder="500000" className={inputCls} />
                </label>
                <label className="w-36">
                  <span className="mb-1 block text-xs font-bold text-stone-600">{t('leads.areaLabel')}</span>
                  <input value={newLeadArea} onChange={(e) => setNewLeadArea(e.target.value)} placeholder="Riverside" className={inputCls} />
                </label>
                <button
                  type="button"
                  onClick={addLead}
                  className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700"
                >
                  <Plus size={16} weight="bold" />
                  {t('leads.addButton')}
                </button>
              </div>
              {leadError && <p className="mt-2 text-xs font-bold text-rose-700">{t('leads.addError')}</p>}
            </div>
          </section>

          {/* Viewings */}
          <section id="viewings" className="mt-6 scroll-mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
            <div className="flex items-center gap-2">
              <CalendarBlank size={20} className="text-orange-700" />
              <h2 className="text-lg font-extrabold">{t('viewings.title')}</h2>
            </div>
            <p className="mt-1 text-sm text-stone-500">{t('viewings.subtitle')}</p>

            {/* Week calendar strip */}
            <h3 className="mt-5 text-sm font-extrabold">{t('viewings.weekTitle')}</h3>
            <div className="mt-3 grid grid-cols-7 gap-2">
              {week.map((day) => {
                const dayViewings = viewings.filter((v) => v.date === day && v.status === 'scheduled')
                return (
                  <div key={day} className="min-h-24 rounded-xl bg-orange-50 p-2 ring-1 ring-orange-100">
                    <p className="text-center text-xs font-extrabold text-stone-600">{dayLabel(day)}</p>
                    <p className="text-center text-lg font-extrabold">{dayNum(day)}</p>
                    {dayViewings.length === 0 ? (
                      <p className="mt-1 text-center text-[10px] font-semibold text-stone-400">{t('viewings.noViewingsWeek')}</p>
                    ) : (
                      <ul className="mt-1 space-y-1">
                        {dayViewings.map((v) => (
                          <li key={v.id} className="rounded-md bg-orange-600 px-1.5 py-1 text-[10px] font-bold leading-tight text-white">
                            {v.time} · {leadName(v.leadId)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Book a viewing */}
            <div className="mt-6 rounded-xl bg-stone-50 p-4 ring-1 ring-stone-200">
              <h3 className="text-sm font-extrabold">{t('viewings.bookTitle')}</h3>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <label className="min-w-44 flex-1">
                  <span className="mb-1 block text-xs font-bold text-stone-600">{t('viewings.propertyLabel')}</span>
                  <select value={bookProperty} onChange={(e) => setBookProperty(e.target.value)} className={inputCls}>
                    {listings.filter((p) => p.status !== 'sold').map((p) => (
                      <option key={p.id} value={p.id}>{p.address}, {p.area} — {fmt(p.price)}</option>
                    ))}
                  </select>
                </label>
                <label className="min-w-40 flex-1">
                  <span className="mb-1 block text-xs font-bold text-stone-600">{t('viewings.leadLabel')}</span>
                  <select value={bookLead} onChange={(e) => setBookLead(e.target.value)} className={inputCls}>
                    {leads.filter((l) => l.status !== 'closed').map((l) => (
                      <option key={l.id} value={l.id}>{l.name} — {fmt(l.budget)}</option>
                    ))}
                  </select>
                </label>
                <label className="w-40">
                  <span className="mb-1 block text-xs font-bold text-stone-600">{t('viewings.dateLabel')}</span>
                  <input type="date" value={bookDate} onChange={(e) => setBookDate(e.target.value)} className={inputCls} />
                </label>
                <label className="w-28">
                  <span className="mb-1 block text-xs font-bold text-stone-600">{t('viewings.timeLabel')}</span>
                  <select value={bookTime} onChange={(e) => setBookTime(e.target.value)} className={inputCls}>
                    {TIME_SLOTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={bookViewing}
                  className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700"
                >
                  <Plus size={16} weight="bold" />
                  {t('viewings.bookButton')}
                </button>
              </div>
              {bookError && <p className="mt-2 text-xs font-bold text-rose-700">{t('viewings.bookError')}</p>}
            </div>

            {/* All viewings */}
            <h3 className="mt-6 text-sm font-extrabold">{t('viewings.upcoming')}</h3>
            <ul className="mt-3 space-y-2">
              {viewings.map((v) => (
                <li
                  key={v.id}
                  className={`flex flex-wrap items-center gap-3 rounded-xl px-4 py-3 text-sm ring-1 ${
                    v.status === 'cancelled' ? 'bg-stone-50 text-stone-400 line-through ring-stone-200' : 'bg-white ring-stone-200'
                  }`}
                >
                  <CalendarBlank size={18} className="text-orange-600" />
                  <span className="font-bold">{v.date} · {v.time}</span>
                  <span className="flex-1">{propertyLabel(v.propertyId)} — {leadName(v.leadId)}</span>
                  <span className="text-xs font-bold">
                    {v.status === 'done' ? t('viewings.done') : v.status === 'cancelled' ? t('viewings.cancelled') : t('viewings.scheduled')}
                  </span>
                  {v.status === 'scheduled' && (
                    <>
                      <button
                        type="button"
                        onClick={() => completeViewing(v.id)}
                        className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                      >
                        <Check size={14} />
                        {t('viewings.markDone')}
                      </button>
                      <button
                        type="button"
                        onClick={() => cancelViewing(v.id)}
                        className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-rose-700 ring-1 ring-rose-300 hover:bg-rose-50"
                      >
                        <X size={14} />
                        {t('viewings.cancel')}
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <footer className="mt-8 border-t border-stone-200 pt-4 pb-2 text-center text-xs text-stone-500">
            <p>{t('footer.demo')}</p>
            <p className="mt-1">{t('footer.madeWith')}</p>
          </footer>
        </main>
      </div>
    </div>
  )
}
