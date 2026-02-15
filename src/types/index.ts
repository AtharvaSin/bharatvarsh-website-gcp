/**
 * Bharatvarsh Website Type Definitions
 */

// ========================================
// Timeline Types
// ========================================

export type EventType = 'economic' | 'political' | 'conflict' | 'governance' | 'era';

export type ImpactType =
  | 'economic'
  | 'political'
  | 'social'
  | 'military'
  | 'infrastructure'
  | 'technological';

export interface TimelineEventDate {
  original: string;
  start_year: number;
  end_year: number;
  is_range: boolean;
}

export interface TimelineEventMetadata {
  event_type: EventType;
  impacts: ImpactType[];
  locations: string[] | null;
  significance: 1 | 2 | 3 | 4 | 5;
  remarks?: string;
}

export interface TimelineEventMedia {
  icon: string;
  color: string;
  image?: string; // Optional path to event illustration (landscape)
  imagePortrait?: string; // Optional portrait variant for mobile orientation
}

export interface TimelineEvent {
  id: number;
  title: string;
  date: TimelineEventDate;
  description: string;
  slug: string;
  metadata: TimelineEventMetadata;
  media: TimelineEventMedia;
}

export interface TimelineData {
  timeline: {
    title: string;
    subtitle: string;
    total_events: number;
    time_span: {
      start: number;
      end: number;
    };
  };
  events: TimelineEvent[];
}

// ========================================
// Character Types
// ========================================

export type CharacterRole =
  | 'protagonist'
  | 'deuteragonist'
  | 'antagonist'
  | 'supporting'
  | 'complex'
  | 'mystery'
  | 'hidden';

export type AllegianceType =
  | 'military'
  | 'ambiguous'
  | 'unknown'
  | 'classified';

export interface CharacterName {
  english: string;
  devanagari: string;
}

export interface CharacterConnection {
  character: string;
  relationship: string;
}

export interface CharacterMedia {
  portrait: string | null;
  silhouette: boolean;
}

export interface Character {
  id: string;
  name: CharacterName;
  role: CharacterRole;
  archetype: string;
  title: string;
  allegiance: AllegianceType | string;
  status: string;
  tagline: string;
  description: string;
  traits: string[];
  connections: CharacterConnection[];
  arc: string;
  mystery_level: 1 | 2 | 3 | 4 | 5;
  featured: boolean;
  media: CharacterMedia;
}

export interface CharactersData {
  characters: Character[];
}

// ========================================
// Faction Types
// ========================================

export type FactionType =
  | 'government'
  | 'infrastructure'
  | 'resistance'
  | 'historical'
  | 'commercial';

export type FactionStatus =
  | 'ruling'
  | 'active'
  | 'underground'
  | 'dissolved'
  | 'regulated';

export interface Faction {
  id: string;
  name: string;
  type: FactionType;
  status: FactionStatus;
  founded: number | string;
  description: string;
  ideology: string;
  key_figures: string[];
  headquarters: string;
  influence: string[];
  color: string;
  icon: string;
}

export interface FactionsData {
  factions: Faction[];
}

// ========================================
// Location Types
// ========================================

export type LocationType = 'military' | 'metropolis' | 'region' | 'infrastructure';

export interface LocationFeature {
  name: string;
  description: string;
}

export interface LightingPreset {
  name: string;
  description: string;
}

export interface LocationMedia {
  image: string | null;
  ambiance: string;
}

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  region: string;
  status: string;
  description: string;
  features: LocationFeature[];
  lighting_presets?: LightingPreset[];
  atmosphere: string;
  significance: string;
  media: LocationMedia;
}

export interface LocationsData {
  locations: Location[];
}

// ========================================
// Technology Types
// ========================================

export interface TechnologyItem {
  id: string;
  name: string;
  type: string;
  description: string;
  capabilities: string[];
  deployment?: string;
  restrictions?: string;
  location?: string;
}

export interface TechnologyData {
  technology: {
    surveillance: TechnologyItem[];
    devices: TechnologyItem[];
    infrastructure: TechnologyItem[];
  };
}

// ========================================
// Scrollytelling Types
// ========================================

export interface ScrollSection {
  id: number;
  title: string;
  headline: string | null;
  content: string;
  subtext: string | null;
  visual: string;
  animation: string;
  duration: string;
  cta?: Array<{
    label: string;
    link: string;
  }>;
}

export interface ScrollytellingData {
  scrollytelling: {
    sections: ScrollSection[];
  };
}

// ========================================
// Relationship Types
// ========================================

export interface CharacterToFaction {
  character: string;
  faction: string;
  role: string;
}

export interface CharacterToLocation {
  character: string;
  location: string;
  relation: string;
}

export interface FactionToLocation {
  faction: string;
  location: string;
  relation: string;
}

export interface EventToFaction {
  event: string;
  faction: string;
  relation: string;
}

export interface RelationshipsData {
  relationships: {
    character_to_faction: CharacterToFaction[];
    character_to_location: CharacterToLocation[];
    faction_to_location: FactionToLocation[];
    event_to_faction: EventToFaction[];
  };
}

// ========================================
// Component Props Types
// ========================================

export interface BaseComponentProps {
  className?: string;
}

export type BadgeVariant =
  | 'default'
  | 'outline'
  | 'protagonist'
  | 'antagonist'
  | 'supporting'
  | 'mystery'
  | 'classified'
  | 'declassified'
  | 'characters'
  | 'locations'
  | 'factions'
  | 'tech';

// ========================================
// Lore Types
// ========================================

export type LoreCategory = 'characters' | 'locations' | 'factions' | 'tech';

export type LoreClassification = 'classified' | 'declassified';

export interface LoreItemMedia {
  card: string;
  banner: string;
}

export interface LoreItem {
  id: string;
  name: string;
  nameDevanagari?: string;
  category: LoreCategory;
  classification: LoreClassification;
  subtype: string;
  tagline: string;
  description: string;
  traits?: string[];
  specifications?: string;
  media: LoreItemMedia;
  featured?: boolean;
  sortOrder: number;
}

export interface LoreData {
  lore: LoreItem[];
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export type ButtonSize = 'sm' | 'md' | 'lg';

// ========================================
// Novel Types
// ========================================

export interface NovelInfo {
  title: string;
  subtitle: string;
  tagline: string;
  genre: string[];
  status: string;
  releaseDate: string | null;
  pages: number | null;
  isbn: string | null;
}

export interface NovelSynopsis {
  hook: string;
  description: string;
  plot: string;
  stakes: string;
  closing: string;
}

export interface NovelTheme {
  title: string;
  description: string;
}

export interface NovelFeature {
  icon: string;
  title: string;
  description: string;
}

export interface NovelQuote {
  text: string;
  context: string;
}

export interface NovelAuthor {
  name: string;
  bio: string;
  note: string;
}

export interface NovelPlatform {
  name: string;
  url: string;
  icon: string;
}

export interface NovelNewsletter {
  enabled: boolean;
  headline: string;
  description: string;
}

export interface NovelPurchase {
  available: boolean;
  platforms: NovelPlatform[];
  newsletter: NovelNewsletter;
}

export interface NovelRelated {
  title: string;
  description: string;
  href: string;
  icon: string;
}

export interface WhatAwaitsYouContent {
  heading: string;
  subline: string;
}

export interface DossierContent {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  pdfChip: string;
  expandedTitle: string;
  emailHelper: string;
  submitButton: string;
  submittedMessage: string;
  resendButton: string;
  verifiedMessage: string;
  privacyNote: string;
  // Download-related fields (shown after verification)
  downloadTitle?: string;
  downloadSubtitle?: string;
  downloadCta?: string;
  downloadedMessage?: string;
  pdfFileName?: string;
  pdfSize?: string;
}

export interface NovelData {
  novel: NovelInfo;
  synopsis: NovelSynopsis;
  themes: NovelTheme[];
  whatAwaitsYou: WhatAwaitsYouContent;
  features: NovelFeature[];
  dossier: DossierContent;
  quotes: NovelQuote[];
  author: NovelAuthor;
  purchase: NovelPurchase;
  related: NovelRelated[];
}

// ========================================
// Dossier Form Types
// ========================================

export type DossierState = 'idle' | 'expanded' | 'submitting' | 'submitted' | 'verified';

export type VerifiedStatus = 'success' | 'error' | 'expired' | 'already' | null;

export interface DossierFormData {
  name: string;
  location: string;
  email: string;
}

export interface DossierFormErrors {
  name?: string;
  location?: string;
  email?: string;
}

// ========================================
// API Response Types
// ========================================

export interface LeadApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  code?: 'VALIDATION_ERROR' | 'DUPLICATE_EMAIL' | 'SERVER_ERROR';
}

export interface LeadSubmitPayload extends DossierFormData {
  source: string;
}

// ========================================
// Forum User Types (Phase 2)
// ========================================

export interface UserPublic {
  id: string;
  name: string | null;
  image: string | null;
  bio: string | null;
  role: 'VISITOR' | 'MEMBER' | 'MODERATOR' | 'ADMIN';
  createdAt: string;
}

export interface SessionUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: 'VISITOR' | 'MEMBER' | 'MODERATOR' | 'ADMIN';
}
