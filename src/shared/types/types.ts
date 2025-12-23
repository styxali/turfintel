// ==========================================
// SHARED / COMMON TYPES
// ==========================================

export interface ImageObject {
  updated_at: string;
  slug: string;
}

export interface EntityLink {
  uuid: string;
  slug?: string;
}

export interface RaceParams {
  date: string;    // Format: YYYY-MM-DD
  reunion: string; // e.g. "R1"
  course: string;  // e.g. "C4"
}

export interface HorseHistoryParams {
  range?: [number, number];
  with_meta?: boolean;
  sort?: [string, string];
  forceUnreliable?: number;
}

export interface Hippodrome {
  code?: string;
  name: string;
  country_code?: string;
}

export interface MeteoVentDirection {
  label: string;
}

export interface Pays {
  code: string;
}

export interface Casaque {
  updated_at: string;
  slug: string;
}

export interface Parcours {
  updated_at: string;
  slug: string;
}

export interface PhotoGalleryItem {
  url: string;
  runner?: number;
}

export interface BetLinks {
  socialprono?: string;
}

export interface EnjeuSG {
  montant: number;
}

// ==========================================
// VIDEO PLAYER
// ==========================================

// Step 1: Get video info URL
export interface VideoPlayerResponse {
  video_url: string; // URL to fetch actual video formats
  thumbnail: string; // Thumbnail image URL
  vertical: boolean; // Video orientation
  vast_tag: string; // Ad tag URL
}

// Step 2: Fetch actual video formats from video_url
export interface VideoPlayerFormats {
  mp4: {
    "240": string; // 240p MP4 URL
    "360": string; // 360p MP4 URL
    "480": string; // 480p MP4 URL
    "540": string; // 540p MP4 URL
    "720": string; // 720p MP4 URL
  };
  hls: string; // HLS playlist URL (adaptive streaming)
  master: string; // Master MP4 URL (highest quality)
}

// ==========================================
// RACE DETAILS (Course)
// ==========================================

export interface RacePartant {
  num_partant: number;
  casaque: Casaque;
  cheval: {
    nom_cheval: string;
    sexe_cheval: string; // "M", "F", "H"
    age_cheval: number;
    musique: string;
    short_musique?: string;
    gains_carriere: number;
    valeur?: number;
    uuid: string;
    slug: string;
    entraineur?: { nom_entraineur: string };
  };
  monte: {
    nom_monte: string;
  };
  entraineur: {
    nom_entraineur: string;
  };
  place_corde_partant: string;
  cote_reference?: number; 
  statut_part: string; // "DP", "NP"
  statut_part_pcc: string;
  num_place_arrivee?: string;
  temps_part?: string;
  texte_place_arrivee?: string;
  silks_path: string;
  
  // Weight
  pds_calc_hand_partant: number;
  pds_cond_monte_partant: number;
  
  // Equipment
  oeil_partant: string; // "N", "O", "A"
  oeil_partant_first_time: boolean;
  bonnet: boolean;
  attache_langue: boolean;
  deferrer_partant: string;
  deferrer_partant_first_time: boolean;
  type_eng: string;
  
  // Handicap
  valeur?: number;
  
  // Duplicated from cheval for convenience
  age_cheval: number;
  sexe_cheval: string;
  gains_carriere: number;
  musique: string;
  short_musique?: string;
}

export interface StatusCourse {
  num_course_pmu: number;
  type_statut_course_id: string; // "finished", "upcoming"
  real_heure_course: string;
  is_pick_five: boolean;
  is_quinte_plus: boolean;
}

export interface Reunion {
  lib_reunion: string;
  date_reunion: string;
  num_reunion: number;
  specialite_reunion: string; // "Plat", "Trot", "Obstacle"
  hippodrome: Hippodrome;
  
  // Weather
  meteo_temperature?: string;
  meteo_vent_direction?: MeteoVentDirection;
  meteo_vent_force?: string;
  meteo_nebulosite_code?: string;
  meteo_nebulosite_libelle_court?: string;
  
  // Timing
  heure_reunion_racing?: string;
  heure_fin_reunion?: string;
  
  // Flags
  is_pmh: boolean;
  is_premium?: boolean;
  
  // Streaming
  flux_url?: string;
  flux_type?: string; // "RACING"
  flux_active?: boolean;
  
  // Courses
  num_courses?: number[];
  status_courses: StatusCourse[];
}

export interface PariType {
  code_pari: string;
  titre: string;
  type_paris: string; // "OFF", "ON"
  color?: string;
  odds_type?: string;
}

export interface PariCourse {
  pari_type: PariType;
  audience: string; // "Nationale", "Internationale"
}

export interface RaceDetailResponse {
  id: number;
  uuid: string;
  guid: string;
  
  // Meeting
  reunion: Reunion;
  pays?: Pays;
  
  // Race Info
  num_course_pmu: number;
  libcourt_prix_course: string;
  liblong_prix_course?: string;
  lib_corde_course?: string;
  discipline: string; // "Plat", "Trot", "Obstacle"
  categ_course: string; // "HANDICAP DIVISE"
  type_course?: string; // "Classe 3"
  distance: number;
  lib_parcours_course?: string;
  description?: string;
  groupe?: string; // "G1", "G2", "G3", ""
  
  // Conditions
  etat_terrain: string;
  lib_piste_course?: string;
  conditions_txt_course: string;
  heure_releve_penetr?: string;
  
  // Timing
  heure_depart_course: string;
  real_heure_course?: string;
  
  // Status
  statut_course_id?: number; // 16 = finished
  type_statut_course_id?: string; // "finished"
  nbdeclare_course?: number;
  
  // Flags
  is_quinte_plus: boolean;
  is_quinte_new?: boolean;
  is_pick_five?: boolean;
  is_pmh: boolean;
  is_tirelire?: boolean;
  is_booster?: boolean;
  tracked?: boolean;
  world_pool?: boolean;
  
  // Financial
  montant_total_allocation?: string;
  enjeu_s_g?: EnjeuSG;
  
  // Media
  photo?: ImageObject;
  photo_path?: string;
  photo_finish?: string;
  photo_gallery?: PhotoGalleryItem[];
  parcours?: Parcours;
  video_course_id?: string;
  video_course_nom?: string;
  
  // Betting
  pari_courses: PariCourse[];
  bet_links?: BetLinks;
  
  // Runners
  partants: RacePartant[];
}

// ==========================================
// PRONOSTICS & ANALYSIS
// ==========================================

export interface PronosticCreator {
  firstname: string;
  lastname: string;
  photo_url: string;
  is_journalist: boolean;
  class_key: number;
  uuid: string;
  slug: string;
}

export interface PronosticPartant {
  casaque: Casaque;
  num_partant: number;
  uuid: string;
}

export interface PronosticCheval {
  nom_cheval: string;
  slug: string;
  uuid: string;
  casaque: Casaque;
}

export interface PronosticAnalysis {
  cheval: PronosticCheval;
  partant: PronosticPartant;
  position: number;
  note_numerique: number;
  cote_journaliste: number;
  num_partant: number;
  analysis_horse?: string;
}

export interface PronosticBetLinks {
  zeturf?: string;
  socialprono?: string;
}

export interface PronosticResponse {
  pronostic_analyses: PronosticAnalysis[];
  creator: PronosticCreator;
  type: string; // "analysis_by_horse"
  status: string; // "published"
  chapeau: string;
  published_at: string;
  validated: boolean;
  validated_at: string;
  difficulty: number; // 1-5
  uuid: string;
  bases: number[];
  belles_chances: number[];
  outsiders: number[];
  delaisses: number[];
  bet_links?: PronosticBetLinks;
  presentation?: string; // Legacy field
}

export interface InterviewPartantInfo {
  cheval: {
    nom_cheval: string;
    uuid: string;
  };
  num_partant: number;
  uuid: string; // Partant UUID
}

export interface InterviewPartant {
  partant: InterviewPartantInfo;
  personne: string; // "Christophe Plisson, entraîneur" or "L'avis du reporter"
  note?: number; // Confidence rating 0-10 (optional - not present for reporter opinions)
  texte: string; // Interview text
  uuid: string; // Interview UUID
  subtitle?: string; // Legacy field
  short_title?: string; // Legacy field
}

export interface InterviewAuthor {
  firstname: string;
  lastname: string;
  photo_url: string;
  is_journalist: boolean;
  class_key: number;
  uuid: string;
  slug: string;
}

export interface InterviewResponse {
  interview_partants: InterviewPartant[];
  author: InterviewAuthor;
  status: string; // "published"
  updated_at: string;
  uuid: string;
}

export interface InterneNotePartant {
  note_id_nav_partant: string;
  note_equidia: number; // Overall rating 0-20
  aptitudes: number; // 0-1
  forme_cheval: number; // 0-1
  conditions: number; // 0-1
  tandem: number; // 0-1
  apt_terrain: number; // 0-1
  note_created_at: string;
  note_updated_at: string;
  bruits_ecuries?: number; // Legacy field, may not be present
  pronos?: number; // Legacy field, may not be present
}

export interface NoteResponseItem {
  // Identifiers
  num_partant: number;
  uuid: string; // Partant UUID
  
  // Casaque
  casaque: Casaque;
  
  // Horse
  cheval: {
    nom_cheval: string;
    musique: string;
    gains_carriere: number;
    uuid: string;
  };
  
  // Jockey (monte)
  monte: {
    nom_monte: string;
    uuid: string;
  };
  
  // Trainer (entraineur)
  entraineur: {
    nom_entraineur: string;
    uuid: string;
  };
  
  // Equipment
  oeil_partant: string;
  oeil_partant_first_time: boolean;
  bonnet: boolean;
  attache_langue: boolean;
  deferrer_partant: string;
  deferrer_partant_first_time: boolean;
  
  // Status
  statut_part: string;
  statut_part_pcc: string;
  num_place_arrivee?: string;
  texte_place_arrivee?: string;
  
  // Media
  silks_path: string;
  
  // Duplicated gains_carriere
  gains_carriere: number;
  
  // Equidia Rating
  interne_note_partant: InterneNotePartant;
}
export type NoteResponse = NoteResponseItem[];

// ==========================================
// RAPPORTS (Betting Results)
// ==========================================

export interface RapportPariType {
  code_pari: string; // "1", "2", "3", "4", "8", "9", "20", "41", "42"
  titre: string; // "Simple gagnant", "Couplé", "Trio", "Multi"
  type_paris: string; // "OFF", "ON", "ON-OFF"
  bet_path?: string; // SVG icon URL
  odds_type?: string; // "TYPE_RAPPORT_GAGNANT_PLACE", "TYPE_RAPPORT_TYPE", etc.
  weight?: number; // Display order
}

export interface RapportCombinaison {
  combinaison_rap_def: string; // "08", "08-01", "08-01-09"
  type_reserve_rap_def: string; // "Simple", "Couplé", "Trio", "Multi en 4"
  
  // Payouts (French decimal format: "32,00")
  gagnant?: string; // Win payout for base stake
  gagnant_mb?: string; // Win payout for double stake
  place?: string; // Place payout for base stake
  place_mb?: string; // Place payout for double stake
  
  // Bet amounts
  sum_mises_gagn?: string; // Total win bets
  sum_mises_place?: string; // Total place bets
  sum_mises_gagn_type_res_rap_def?: string; // Total win bets for this type
  sum_mises_place_type_res_rap_def?: string; // Total place bets for this type
}

export interface RapportDefinitif {
  mise_base: string; // Base stake: "2,00", "3,00"
  code_pari_generique: string; // Generic bet code
  audience_pari_course: string; // Audience code: "04"
  numeros_gagnants_option: number[]; // Winning numbers for special bets
  combinaisons: RapportCombinaison[];
}

export interface RapportResponseItem {
  pari_type: RapportPariType;
  rapport_definitif?: RapportDefinitif;
}
export type RapportResponse = RapportResponseItem[];

// ==========================================
// ARTICLES
// ==========================================

export interface ArticleImageALaUne {
  updated_at: string;
  slug: string;
}

export interface ArticleAuthor {
  firstname: string;
  lastname: string;
  is_journalist: boolean;
}

export interface ArticleTag {
  uuid: string;
  name: string;
  translations: {
    fr_FR: {
      name: string;
      slug: string;
    };
  };
}

export interface ArticleCategory {
  uuid: string;
  name: string;
  translations: {
    fr_FR: {
      name: string;
      description?: string;
      slug: string;
    };
    de_DE?: {
      name: string;
      slug: string;
    };
    en_GB?: {
      name: string;
      slug: string;
    };
  };
}

export interface ArticleResponseItem {
  // Identifiers
  uuid: string;
  slug: string;
  
  // Type & Status
  type: string; // "Classique", "Interview"
  comments_enabled: boolean;
  is_next_qrcode: boolean;
  
  // Images
  image_a_la_une: ArticleImageALaUne;
  image_path: string; // Full URL with watermark/filters
  image_preview_path?: string; // Preview URL
  url_image_article: string; // Final processed URL
  
  // Content (French)
  translations: {
    fr_FR: {
      title: string;
      slug: string;
      chapo: string; // Summary/excerpt
      status: string; // "published"
      published_at: string; // ISO timestamp
    };
  };
  
  // Author
  author: ArticleAuthor;
  
  // Classification
  tags: ArticleTag[];
  category: ArticleCategory;
}

export type ArticleResponse = ArticleResponseItem[];

// ==========================================
// REFERENCES (New)
// ==========================================

export interface ReferenceRace {
  guid?: string;
  reunion: {
    lib_reunion: string;
    hippodrome: { name: string };
    date_reunion: string;
    num_reunion: number;
  };
  photo?: ImageObject;
  libcourt_prix_course: string;
  discipline: string;
  distance: number;
  heure_depart_course: string;
  num_course_pmu: number;
  photo_path?: string;
  reference_message?: string; // Why this race is relevant
  video_id?: string; // Video replay identifier
  photo_finish?: string;
  photo_gallery?: PhotoGalleryItem[];
  partants?: RacePartant[];
}

export interface ReferencesResponse {
  results: {
    references: ReferenceRace[]; // Direct reference races
    favoris: ReferenceRace[]; // Races where current runners were favorites
    most_common: ReferenceRace[]; // Races with most common runners
    same_prix: ReferenceRace[]; // Historical editions of same race
    same_conditions: ReferenceRace[]; // Same distance/terrain/runners
    best_associations: ReferenceRace[]; // Best jockey/horse combinations
  };
}

// ==========================================
// DAILY REUNIONS (Meetings)
// ==========================================

export interface DailyPartant {
  statut_part: string; // "DP", "NP"
  statut_part_pcc: string;
  num_place_arrivee?: string; // "01", "02" or "Non partant" (for finished races)
  num_partant: number;
}

export interface DailyCourse {
  etat_terrain?: string; // Terrain condition (for finished races)
  libcourt_prix_course: string;
  lib_corde_course?: string; // "Corde à droite"
  discipline: string;
  distance: number;
  is_quinte_plus: boolean;
  is_quinte_new: boolean;
  heure_depart_course: string;
  real_heure_course: string;
  num_course_pmu: number;
  nbdeclare_course: number;
  ind_cei: boolean; // International race flag
  is_pmh: boolean;
  categ_course: string; // "HANDICAP DIVISE", "A RECLAMER"
  montant_total_allocation: string;
  world_pool: boolean;
  guid: string;
  nb_partants: number;
  partants: DailyPartant[];
  type_statut_course_id: string; // "before", "finished"
  is_pick_five: boolean;
  groupe: string;
  is_groupe_i: boolean;
  is_tirelire: boolean;
  is_booster: boolean;
  booster?: string; // Booster amount if applicable
  description: string;
}

export interface DailyAudience {
  label: string; // "Nationale avec événement"
  code: string; // "N, Q+"
}

export interface DailyFederation {
  name: string; // "France Galop"
  nom_interne: string; // "france-galop"
}

export interface DailyHippodrome {
  federation?: DailyFederation;
  name: string;
  code: string;
}

export interface DailyReunion {
  pays_site_reunion: string; // "FRA", "USA", "CHL"
  lib_reunion: string; // "CHANTILLY"
  audience: DailyAudience;
  hippodrome: DailyHippodrome;
  date_reunion: string; // YYYY-MM-DD
  num_reunion: number;
  specialite_reunion: string; // "Plat", "Trot", "Obstacle"
  type_reunion_id: string; // "D", "S"
  heure_reunion: string; // "11:24"
  uuid: string;
  heure_reunion_racing: string; // "11:19"
  is_racing: boolean;
  heure_debut_reunion: string; // First race time
  heure_fin_reunion: string; // Last race time
  courses_by_day: DailyCourse[];
  is_pmh: boolean;
  is_premium: boolean;
  is_csi: boolean;
  is_csi_pmu: boolean;
  disciplines: string[]; // ["Plat"], ["Attelé", "Monté"]
  is_canceled: boolean;
  is_quinte: boolean;
  is_quarte: boolean;
  flux_url: string; // "racing1", "racing2"
  flux_type: string; // "RACING"
  flux_active: boolean;
}

export type DailyReunionResponse = DailyReunion[];

// ==========================================
// NOTULES (Analysis)
// ==========================================

export interface NotulePartantInfo {
  casaque: Casaque;
  cheval: {
    nom_cheval: string;
    uuid: string;
  };
  monte: {
    nom_monte: string;
  };
  statut_part: string;
  statut_part_pcc: string;
  texte_place_arrivee: string;
  num_place_arrivee: string;
  id: number; // Internal partant ID
  num_partant: number;
  uuid: string; // Partant UUID
}

export interface NotulePartant {
  partant: NotulePartantInfo;
  texte: string; // Race commentary for this horse
  impression_active: boolean; // Left a good impression
  uuid: string; // Notule partant UUID
}

export interface NotuleAuthor {
  firstname: string;
  lastname: string;
  photo_url: string;
  is_journalist: boolean;
  class_key: number;
  uuid: string;
  slug: string;
}

export interface NotuleResponse {
  notule_partants: NotulePartant[];
  author: NotuleAuthor;
  accroche: string; // Headline
  analyse: string; // Overall race analysis
  status: string; // "published"
  updated_at: string;
  uuid: string;
}

// ==========================================
// TRACKING (GPS)
// ==========================================

export interface InterneTrackingGps {
  tracking_id_nav_partant: string; // Internal tracking ID
  vmax: number; // Maximum speed (km/h)
  temps_officiel: string; // Official time (MM'SS''CC)
  derniers_600m: string; // Last 600m sectional
  derniers_200m: string; // Last 200m sectional
  derniers_100m: string; // Last 100m sectional
  distance_parcouru: number; // Distance traveled (meters)
  pos_moy: number; // Average position during race
  pos_mi_course: number; // Position at mid-race
  parcouru_vs_1er: number; // Distance vs winner (meters)
  active: number; // Active flag (1 = active, 0 = inactive)
  tracking_created_at: string; // Creation timestamp
  tracking_updated_at: string; // Update timestamp
}

export interface TrackingResponseItem {
  casaque: Casaque;
  cheval: {
    nom_cheval: string;
    uuid: string;
  };
  num_partant: number;
  num_place_arrivee: string;
  texte_place_arrivee: string;
  interne_tracking_gps: InterneTrackingGps;
}
export type TrackingResponse = TrackingResponseItem[];

// ==========================================
// HORSE HISTORY
// ==========================================

export interface HorseHistoryMeta {
  content_range: string;
  total: number;
  range_start: number;
  range_end: number;
  current_page: number;
}

export interface SelectedPartantInfo {
  num_place_arrivee: string;
  texte_place_arrivee: string;
  pds_calc_hand_partant: number;
  oeil_partant: string;
  temps_part?: string;
  nom_monte: string;
  valeur?: number;
  musique: string;
  
  // Tracking data (if available)
  vmax?: number;
  temps_officiel?: string;
  derniers_600m?: string;
  derniers_200m?: string;
  derniers_100m?: string;
  distance_parcouru?: number;
  pos_mi_course?: number;
  parcouru_vs_1er?: number;
  
  // Analysis
  notule_partant_text?: string;
  notule_author_firstname?: string;
  notule_author_lastname?: string;
}

export interface HorseHistoryRace {
  etat_terrain: string;
  reunion: {
    lib_reunion: string;
    hippodrome: { name: string };
    date_reunion: string;
    num_reunion: number;
  };
  libcourt_prix_course: string;
  liblong_prix_course?: string;
  discipline: string;
  categ_course?: string;
  distance: number;
  num_course_pmu: number;
  type_course?: string;
  montant_total_allocation?: string;
  guid: string;
  uuid: string;
  selected_partant_info: SelectedPartantInfo;
}

export interface HorseHistoryResponse {
  meta?: HorseHistoryMeta;
  results: HorseHistoryRace[];
}

// ==========================================
// PARI SIMPLE (Live Odds)
// ==========================================

export interface PariSimpleCheval {
  nom_cheval: string;
  intention_deferrer: string; // "ferré des 4", "déferré des 4"
}

export interface PariSimpleHistoryPoint {
  rapp_evol: number; // Odds at this point (can be decimal like 8.6)
  montant_enjeu_total: string; // Total bet amount: "45432", "3018"
}

export interface PariSimpleRunner {
  // Horse Info
  cheval: PariSimpleCheval;
  uuid: string; // Horse UUID
  num_partant: number;
  
  // Current Odds
  channel: string; // "OFF", "ON"
  rapp_ref: number; // Reference odds (morning line)
  rapp_evol: number; // Current odds (evolving)
  favori: boolean; // Is favorite
  tendance_signe: string; // "+", "-", "=" (odds trend)
  heure_rap_evol: string; // Last update time: "2025-12-11T10:15:00+01:00"
  
  // Historical Odds Evolution
  history: PariSimpleHistoryPoint[]; // Chronological odds changes
}

export type PariSimpleResponse = PariSimpleRunner[];

// ==========================================
// HORSE STATS
// ==========================================

export interface HorseStatsQuinte {
  nbPlace2a5: number; // Places 2-5 in Quinté
  nbVictoire: number; // Wins in Quinté
  nbCourse: number; // Total Quinté races
  percent: number; // Success rate (places 1-5)
}

export interface HorseStatsCarriereAll {
  nbPlace: number; // Total places (1-3)
  nbVictoire: number; // Total wins
  "4eOU5e": number; // 4th or 5th places
  nbCourse: number; // Total races
  musique: string; // Recent form (last 10 races)
  calculatedMusique: string; // Complete form string
}

export interface HorseStatsCarriere {
  all: HorseStatsCarriereAll;
  // Could have other breakdowns (by terrain, distance, etc.)
}

export interface HorseStatsResponse {
  gains_carriere: number; // Career earnings
  gains_victoire: number; // Earnings from wins
  quinte: HorseStatsQuinte; // Quinté statistics
  carriere: HorseStatsCarriere; // Career statistics
}

// ==========================================
// HORSE LAST OR NEXT
// ==========================================

export interface HorseLastOrNextReunion {
  lib_reunion: string;
  hippodrome: { name: string };
  date_reunion: string;
  num_reunion: number;
  is_unreliable: boolean;
}

export interface HorseLastOrNextPartantInfo {
  cheval: {
    nom_cheval: string;
    slug: string;
    is_unreliable: boolean;
  };
  monte: {
    nom_monte: string;
    is_unreliable: boolean;
  };
  place_corde_partant: string;
  num_partant: number;
  is_unreliable: boolean;
}

export interface HorseLastOrNextRace {
  reunion: HorseLastOrNextReunion;
  libcourt_prix_course: string;
  liblong_prix_course: string;
  lib_corde_course: string;
  discipline: string;
  categ_course: string;
  distance: number;
  id_nav_course: string;
  is_quinte_plus: boolean;
  is_quinte_new: boolean;
  heure_depart_course: string;
  num_course_pmu: number;
  lib_parcours_course: string;
  nbdeclare_course: number;
  type_course: string;
  montant_total_allocation: string;
  is_unreliable: boolean;
  guid: string;
  uuid: string;
  partants: HorseLastOrNextPartantInfo[];
  enjeu_s_g: { montant: number };
  type_statut_course_id: string; // "before", "finished"
  is_pick_five: boolean;
  groupe: string;
  selected_partant_info: any[]; // Empty for next race
  description: string;
}

export interface HorseLastOrNextPartant {
  monte_id: number;
  nom_monte: string;
  nom_entraineur: string;
  nom_pere: string; // Sire
  nom_mere: string; // Dam
  nom_proprietaire: string; // Owner
  id: number;
  pds_calc_hand_partant: number;
  pds_cond_monte_partant: number;
  deferrer_partant: string;
  num_partant: number;
  code_avis_entraineur: string | null;
  libelle_avis_entraineur: string | null;
  stats: any | null;
  attache_langue: number; // 0 or 1
  bonnet: number; // 0 or 1
  oeil_partant: string; // "N", "O", "A"
  reduction_km: number | null;
  temps_part: string | null;
  type_eng: string;
  num_place_arrivee: string | null;
  valeur: number; // Handicap rating
  musique: string;
  dist_partant: number | null;
  
  // Interview
  interview_direct_des_pistes_author: string;
  interview_direct_des_pistes_pro: string; // Who is speaking
  interview_direct_des_pistes: string; // Interview text
  
  // Pronostic Analysis
  pronostic_analysis_pro: string; // Analyst name
  pronostic_analysis: string; // Analysis text
}

export interface HorseLastOrNextMusiques {
  cheval_calculated: string; // Horse form
  trainer_calculated: string; // Trainer form
  monte_calculated: string; // Jockey form
}

export interface HorseLastOrNextResponse {
  type: string; // "next" or "last"
  race: HorseLastOrNextRace;
  partant: HorseLastOrNextPartant;
  musiques: HorseLastOrNextMusiques;
}

// ==========================================
// HORSE FICHE IN RACE
// ==========================================

export interface HorseFicheLastCoteOff {
  channel: string; // "OFF"
  rapp_ref: number; // Reference odds
  rapp_evol: number; // Current odds
  tendance_signe: string; // "+", "-", "="
  heure_rap_evol: string; // ISO timestamp
}

export interface HorseFicheNotulePartant {
  texte: string;
  impression_active: boolean;
}

export interface HorseFichePartant {
  casaque: Casaque;
  cheval: {
    entraineur: { nom_entraineur: string };
    nom_cheval: string;
    sexe_cheval: string;
    age_cheval: number;
    valeur?: number;
    slug: string;
    uuid: string;
  };
  monte: {
    prenom_monte?: string;
    nom_monte: string;
  };
  oeil_partant: string;
  deferrer_partant: string;
  texte_place_arrivee: string;
  num_place_arrivee: string;
  temps_part?: string;
  notule_partants: HorseFicheNotulePartant[];
  entraineur: { nom_entraineur: string };
  num_partant: number;
  place_corde_partant: string;
  pds_calc_hand_partant: number;
  pds_cond_monte_partant: number;
  bonnet: boolean;
  attache_langue: boolean;
  valeur?: number;
  age_cheval: number;
  sexe_cheval: string;
  gains_carriere: number;
  deferrer_partant_first_time: boolean;
  oeil_partant_first_time: boolean;
  musique: string;
  get_last_cote_off: HorseFicheLastCoteOff; // Latest odds
  short_musique: string;
}

export interface HorseFicheCourse {
  video_course_id: string;
  video_course_format_video: string;
  video_course_url_video: string;
  video_course_duree_video: string;
  partants: HorseFichePartant[];
}

export interface HorseFicheInRaceResponse {
  course: HorseFicheCourse;
  notule_partant: {
    texte: string;
    impression_active: boolean;
    num_partant: number;
  };
}

// ==========================================
// PRONO STATS
// ==========================================

export interface PronoStatsResponse {
  // Add structure when we get sample data
  [key: string]: any;
}

// ==========================================
// STATIC ANIMATION
// ==========================================

export interface StaticAnimationResponse {
  // Add structure when we get sample data
  [key: string]: any;
}

// ==========================================
// HORSE FAVORITES
// ==========================================

export interface HorseFavoritesResponse {
  // Add structure when we get sample data
  [key: string]: any;
}
