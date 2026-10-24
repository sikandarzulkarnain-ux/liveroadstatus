import passesData from './passes.json';
import countriesData from './countries.json';

export interface PassRecord {
  id: string;
  slug: string;
  name: string;
  country: string;
  region: string;
  elevation_m: number;
  route_code: string;
  lat: number;
  lng: number;
  status: 'open' | 'restricted' | 'closed' | 'unverified';
  status_source_name: string;
  status_source_url: string;
  last_verified_at: string | null;
  seasonal_window: string;
  winter_equipment_rule: string;
  description: string;
}

export interface RegionInfo {
  name: string;
  slug: string;
  page: string;
  cleanUrl: string;
  passes: number;
}

export interface CountryRecord {
  name: string;
  slug: string;
  continent: string;
  flag: string;
  flagSvgId: string;
  description: string;
  primaryAuthority: string;
  totalPasses: number;
  regionsCount: number;
  regions: RegionInfo[];
}

export const passes: PassRecord[] = passesData as PassRecord[];
export const countries: CountryRecord[] = countriesData as CountryRecord[];

export function getPassBySlug(slug: string): PassRecord | undefined {
  return passes.find(p => p.slug === slug || p.id === slug);
}

export function getPassesByCountry(countryNameOrSlug: string): PassRecord[] {
  const cLower = countryNameOrSlug.toLowerCase();
  return passes.filter(p => p.country.toLowerCase() === cLower || p.country.toLowerCase().replace(/\s+/g, '-') === cLower);
}

export function getPassesByRegion(regionNameOrSlug: string): PassRecord[] {
  const rLower = regionNameOrSlug.toLowerCase();
  return passes.filter(p => p.region.toLowerCase() === rLower || p.region.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') === rLower);
}

export function getCountryBySlug(slug: string): CountryRecord | undefined {
  return countries.find(c => c.slug === slug || c.name.toLowerCase() === slug.toLowerCase());
}

/**
 * Computes exact dynamic metrics so statistics never disagree
 */
export function getSystemStats() {
  const totalPasses = passes.length;
  const totalCountries = countries.length;
  const verifiedPasses = passes.filter(p => p.last_verified_at !== null && p.status !== 'unverified').length;
  const openPasses = passes.filter(p => p.status === 'open').length;
  const restrictedPasses = passes.filter(p => p.status === 'restricted').length;
  const closedPasses = passes.filter(p => p.status === 'closed').length;
  const unverifiedPasses = passes.filter(p => p.status === 'unverified').length;

  return {
    totalPasses,
    totalCountries,
    verifiedPasses,
    openPasses,
    restrictedPasses,
    closedPasses,
    unverifiedPasses
  };
}

/**
 * Computes a human-readable relative time from an ISO timestamp
 */
export function formatRelativeTime(isoString: string | null): string {
  if (!isoString) return 'Unverified';
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMin = Math.max(1, Math.round(diffMs / (60 * 1000)));
    if (diffMin < 60) {
      return `Updated ${diffMin} min ago`;
    }
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) {
      return `Updated ${diffHours} hr ago`;
    }
    const diffDays = Math.round(diffHours / 24);
    return `Updated ${diffDays} d ago`;
  } catch {
    return 'Unverified';
  }
}
