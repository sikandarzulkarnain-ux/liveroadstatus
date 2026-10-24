export type PassStatus = 'OPEN' | 'CLOSED' | 'RESTRICTED' | 'SEASONAL_CLOSURE' | 'TEMPORARILY_CLOSED' | 'UNKNOWN' | 'NEEDS_VERIFICATION' | 'CAUTION' | 'MONITORED';

export type AlertType = 'Closure' | 'Warning' | 'Advisory' | 'All Clear';

export type AlertSeverity = 'critical' | 'warning' | 'advisory' | 'info';

export interface CameraFeed {
  id: string;
  title: string;
  image: string;
  timestamp?: string;
  location?: string;
  milepost?: string;
  direction?: string;
  source?: string;
  updateIntervalMs?: number;
  officialUrl?: string;
  streamUrl?: string;
  type?: 'image' | 'webrtc' | 'hls' | 'mjpeg' | 'iframe';
}

export interface NearbyPassRef {
  id: string;
  slug: string;
  name: string;
  country: string;
  state: string;
  highway: string;
  status: PassStatus;
  elevationFt: number;
  lastUpdated: string;
  distanceKm: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface MountainPass {
  id: string;
  slug: string;
  name: string;
  alternateNames?: string[];
  country: string;
  countryCode: string;
  continent: string;
  state: string;
  highway: string;
  elevationFt: number;
  elevationM: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: PassStatus;
  statusDetail: string; // e.g. "to all vehicles", "Chains required for trucks", "Snow slide clearance"
  lastUpdated: string;
  description: string;
  image: string;
  imageAttribution?: {
    creator: string;
    source: string;
    sourceUrl?: string;
    license: string;
    attribution?: string;
    date?: string;
  };
  officialSource?: string;
  official_source_url?: string;
  official_authority?: string;
  verification_status?: string;
  confidence?: string;
  last_checked_at?: string;
  last_status_change_at?: string;
  source_published_at?: string;
  source_evidence?: string;
  source_url?: string;
  verification?: any;
  weather: {
    tempF: number;
    tempC: number;
    condition: string;
    icon: string;
  };
  snowDepth: {
    depthCm: number;
    depthIn: number;
    condition: string; // "Packed", "Powder", "Ice patches", "Dry"
  };
  wind: {
    speedKmh: number;
    speedMph: number;
    direction: string;
    description: string; // "Light Breeze", "Gusts up to 45 mph"
  };
  roadCondition: string; // e.g. "Bare and wet", "Snow and slush", "Impassable"
  chainRequirement?: string; // "No restriction", "Chains required on all vehicles", etc.
  cameras?: CameraFeed[];
  nearbyPasses: NearbyPassRef[];
  overview: {
    openedYear: number | string;
    lengthMiles: number | string;
    lengthKm: number | string;
    annualSnowfallIn: number | string;
    annualSnowfallM: number | string;
    summary: string;
  };
  faqs: FAQItem[];
  isPopular?: boolean;
  clusterContinent?: string;
  isSeasonal?: boolean;
  seasonalClosureInfo?: {
    typicalClosure: string;
    typicalReopening: string;
    description: string;
  };
  forecast?: {
    day: string;
    condition: string;
    tempHighF: number;
    tempLowF: number;
    icon: string;
  }[];
  dataSources?: {
    name: string;
    type: string;
    url?: string;
  }[];
  permitInfo?: {
    isRequired: boolean;
    permitName: string;
    quotaDetails: string;
    applyUrl: string;
    portalName: string;
    costInfo: string;
    instructions: string[];
    keyRules: string[];
  };
  openingDateInfo?: {
    year: number;
    statusText: string;
    expectedOpeningWindow: string;
    closingWindow: string;
    clearanceAgency: string;
    notes: string;
    atalTunnelBypassNote?: string;
  };
  quickFacts?: {
    state: string;
    mountainRange: string;
    elevationSummary: string;
    connects: string;
    nearestTown: string;
    roadType: string;
    bestTime: string;
    highlight: string;
  };
  routeDetails?: {
    distanceKm: number;
    distanceMiles: number;
    duration: string;
    origin: string;
    destination: string;
    waypoints: string[];
  };
  borderInfo?: {
    isBorderCrossing: boolean;
    countries: string[];
    southAfricaHours: string;
    lesothoHours: string;
    clearanceDeadline: string;
    documentRequirements: string[];
    vehicleRequirements: string[];
    tollInfo: string;
  };
  toursInfo?: {
    summary: string;
    departures: {
      title: string;
      origin: string;
      description: string;
      highlights: string[];
    }[];
    tips: string[];
  };
  accommodationInfo?: {
    summary: string;
    lodges: {
      name: string;
      location: string;
      type: string;
      description: string;
      website?: string;
    }[];
  };
  cyclingInfo?: {
    summary: string;
    approaches: {
      name: string;
      origin: string;
      distanceKm: number;
      distanceMiles: number;
      elevationGainM: number;
      elevationGainFt: number;
      avgGradient: string;
      maxGradient: string;
      hairpins: number;
      description: string;
    }[];
    bestSeason: string;
    safetyTips: string[];
    bikeDayInfo?: string;
  };
  drivingInfo?: {
    summary: string;
    characteristics: string[];
    switchbacksCount: string;
    safetyAndEtiquette: string[];
    motorcycleTips: string[];
  };
  distancesTable?: {
    location: string;
    distance: string;
    route: string;
    notes?: string;
  }[];
  trafficSchedule?: {
    title: string;
    timingDetails: string;
    rules: string[];
  };
  narrativeSections?: {
    title: string;
    content: string;
  }[];
  historicalSections?: {
    title: string;
    content: string;
  }[];
  customSeo?: {
    title: string;
    description: string;
    h1?: string;
  };
  searchKeywords?: string[];
  aliases?: string[];
  elevationProfile?: {
    minElevationFt: number;
    maxElevationFt: number;
    grade: string;
    points: {
      distanceMiles: number;
      elevationFt: number;
      label: string;
    }[];
  };
  travelTips?: string[];
  history?: {
    year: string;
    title: string;
    description: string;
  }[];
  keywords?: string[];
  webcamNote?: string;
  verificationMethod?: string;
}

export interface PassAlert {
  id: string;
  passId: string;
  passName: string;
  slug: string;
  country: string;
  state: string;
  highway: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  status: PassStatus;
  timestamp: string;
  source: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  iconName: string;
  badge?: string;
  ctaText: string;
  content?: string;
}
