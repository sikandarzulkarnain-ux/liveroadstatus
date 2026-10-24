export type SearchIntent =
  | 'Real-Time Intent'
  | 'Informational'
  | 'Navigational'
  | 'Commercial'
  | 'Transactional'
  | 'Local'
  | 'Travel/Planning';

export type DifficultyCategory = 'EASY' | 'MODERATE' | 'DIFFICULT' | 'VERY_DIFFICULT';

export type RecommendedAction =
  | 'Create new page'
  | 'Optimize existing page'
  | 'Create supporting article'
  | 'Add section'
  | 'Build internal links'
  | 'Monitor'
  | 'Avoid for now';

export type PriorityTier = 'DO_NOW' | 'DO_NEXT' | 'LONG_TERM';

export interface KeywordItem {
  id: string;
  keyword: string;
  normalizedKeyword: string;
  seedKeyword: string;
  passId?: string;
  passName?: string;
  searchVolume: number | 'N/A';
  difficulty: number; // 0 - 100
  difficultyCategory: DifficultyCategory;
  cpc: number | 'N/A';
  intent: SearchIntent;
  opportunityScore: number; // 0 - 100
  competitionLevel: 'Low' | 'Medium' | 'High';
  source: 'Google Suggest' | 'DataForSEO' | 'Semrush' | 'Ahrefs' | 'LivePass Intelligence Engine';
  isVerified: boolean;
  isRealTime: boolean;
  existingRank: number | 'N/A';
  strikingDistance: boolean; // rank 4-30
  impressions?: number;
  clicks?: number;
  ctr?: number;
  recommendedAction: RecommendedAction;
  priorityTier: PriorityTier;
  opportunityWhy: string[];
  serpWeaknessSummary?: string;
  targetPageUrl?: string;
  clusterId?: string;
  clusterName?: string;
}

export interface SerpCompetitor {
  position: number;
  url: string;
  domain: string;
  title: string;
  snippet: string;
  contentType: 'Government DOT' | 'Live Camera / Travel' | 'Forum / Community' | 'Wikipedia' | 'Commercial / Blog';
  domainStrength: 'High' | 'Medium' | 'Low';
  hasLiveStatus: boolean;
  hasWebcam: boolean;
  hasFaq: boolean;
  hasMaps: boolean;
  isForum: boolean;
  hasThinContent: boolean;
  freshnessDays: number;
  weaknesses: string[];
}

export interface KeywordCluster {
  id: string;
  name: string;
  seedKeyword: string;
  intent: SearchIntent;
  primaryKeyword: string;
  keywords: KeywordItem[];
  totalVolume: number;
  avgDifficulty: number;
  avgOpportunity: number;
  recommendedPageType: 'Live Status Page' | 'Webcam & Cameras Page' | 'Weather & Snow Guide' | 'Travel / Directions Guide' | 'FAQ / Seasonal Guide';
  targetUrl: string;
  contentGapTopics: string[];
  headingOutline: {
    h1: string;
    h2s: string[];
    faqs: { question: string; answer: string }[];
  };
}

export interface InternalLinkSuggestion {
  sourcePageTitle: string;
  sourceUrl: string;
  targetPageTitle: string;
  targetUrl: string;
  suggestedAnchor: string;
  reason: string;
}

export interface SeoRecommendation {
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: SearchIntent;
  recommendedUrl: string;
  recommendedTitle: string;
  recommendedH1: string;
  metaDescription: string;
  suggestedHeadings: string[];
  contentTopics: string[];
  faqQuestions: { question: string; answer: string }[];
  internalLinks: InternalLinkSuggestion[];
  schemaRecommendation: string;
  freshnessStrategy: string;
  competitionAnalysis: string;
  rankingStrategy: string;
}

export interface QuickWinItem {
  type: 'Striking Distance (Pos 4-10)' | 'Page 2 Opportunity (Pos 11-20)' | 'High Impressions / Low CTR' | 'Rising Query';
  keyword: string;
  currentPosition: number;
  impressions: number;
  clicks: number;
  ctr: number;
  opportunityAction: string;
  targetUrl: string;
}

export interface SeoResearchProject {
  id: string;
  seedKeyword: string;
  country: string;
  language: string;
  domain: string;
  maxDifficulty: number;
  minOpportunity: number;
  createdAt: string;
  lastResearched: string;
  totalKeywords: number;
  verifiedKeywordsCount: number;
  easyOpportunitiesCount: number;
  mediumOpportunitiesCount: number;
  highOpportunityCount: number; // score >= 80
  strikingDistanceCount: number;
  realTimeCount: number;
  topOpportunityKeyword: string;
  topOpportunityScore: number;
  keywords: KeywordItem[];
  clusters: KeywordCluster[];
  doNowList: KeywordItem[];
  doNextList: KeywordItem[];
  longTermList: KeywordItem[];
  internalLinkSuggestions: InternalLinkSuggestion[];
  quickWins: QuickWinItem[];
  competitorAnalysis: {
    topDomains: string[];
    commonWeaknesses: string[];
    contentGaps: string[];
  };
}

export interface ApiConfig {
  dataForSeoLogin?: string;
  dataForSeoPassword?: string;
  semrushApiKey?: string;
  ahrefsApiKey?: string;
  googleAdsApiKey?: string;
  gscClientId?: string;
  gscClientSecret?: string;
  useLiveGoogleSuggest: boolean;
}
