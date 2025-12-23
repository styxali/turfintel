export interface ImageObject {
    updated_at: string;
    slug: string;
}
export interface EntityLink {
    uuid: string;
    slug?: string;
}
export interface RaceParams {
    date: string;
    reunion: string;
    course: string;
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
export interface VideoPlayerResponse {
    video_url: string;
    thumbnail: string;
    vertical: boolean;
    vast_tag: string;
}
export interface VideoPlayerFormats {
    mp4: {
        "240": string;
        "360": string;
        "480": string;
        "540": string;
        "720": string;
    };
    hls: string;
    master: string;
}
export interface RacePartant {
    num_partant: number;
    casaque: Casaque;
    cheval: {
        nom_cheval: string;
        sexe_cheval: string;
        age_cheval: number;
        musique: string;
        short_musique?: string;
        gains_carriere: number;
        valeur?: number;
        uuid: string;
        slug: string;
        entraineur?: {
            nom_entraineur: string;
        };
    };
    monte: {
        nom_monte: string;
    };
    entraineur: {
        nom_entraineur: string;
    };
    place_corde_partant: string;
    cote_reference?: number;
    statut_part: string;
    statut_part_pcc: string;
    num_place_arrivee?: string;
    temps_part?: string;
    texte_place_arrivee?: string;
    silks_path: string;
    pds_calc_hand_partant: number;
    pds_cond_monte_partant: number;
    oeil_partant: string;
    oeil_partant_first_time: boolean;
    bonnet: boolean;
    attache_langue: boolean;
    deferrer_partant: string;
    deferrer_partant_first_time: boolean;
    type_eng: string;
    valeur?: number;
    age_cheval: number;
    sexe_cheval: string;
    gains_carriere: number;
    musique: string;
    short_musique?: string;
}
export interface StatusCourse {
    num_course_pmu: number;
    type_statut_course_id: string;
    real_heure_course: string;
    is_pick_five: boolean;
    is_quinte_plus: boolean;
}
export interface Reunion {
    lib_reunion: string;
    date_reunion: string;
    num_reunion: number;
    specialite_reunion: string;
    hippodrome: Hippodrome;
    meteo_temperature?: string;
    meteo_vent_direction?: MeteoVentDirection;
    meteo_vent_force?: string;
    meteo_nebulosite_code?: string;
    meteo_nebulosite_libelle_court?: string;
    heure_reunion_racing?: string;
    heure_fin_reunion?: string;
    is_pmh: boolean;
    is_premium?: boolean;
    flux_url?: string;
    flux_type?: string;
    flux_active?: boolean;
    num_courses?: number[];
    status_courses: StatusCourse[];
}
export interface PariType {
    code_pari: string;
    titre: string;
    type_paris: string;
    color?: string;
    odds_type?: string;
}
export interface PariCourse {
    pari_type: PariType;
    audience: string;
}
export interface RaceDetailResponse {
    id: number;
    uuid: string;
    guid: string;
    reunion: Reunion;
    pays?: Pays;
    num_course_pmu: number;
    libcourt_prix_course: string;
    liblong_prix_course?: string;
    lib_corde_course?: string;
    discipline: string;
    categ_course: string;
    type_course?: string;
    distance: number;
    lib_parcours_course?: string;
    description?: string;
    groupe?: string;
    etat_terrain: string;
    lib_piste_course?: string;
    conditions_txt_course: string;
    heure_releve_penetr?: string;
    heure_depart_course: string;
    real_heure_course?: string;
    statut_course_id?: number;
    type_statut_course_id?: string;
    nbdeclare_course?: number;
    is_quinte_plus: boolean;
    is_quinte_new?: boolean;
    is_pick_five?: boolean;
    is_pmh: boolean;
    is_tirelire?: boolean;
    is_booster?: boolean;
    tracked?: boolean;
    world_pool?: boolean;
    montant_total_allocation?: string;
    enjeu_s_g?: EnjeuSG;
    photo?: ImageObject;
    photo_path?: string;
    photo_finish?: string;
    photo_gallery?: PhotoGalleryItem[];
    parcours?: Parcours;
    video_course_id?: string;
    video_course_nom?: string;
    pari_courses: PariCourse[];
    bet_links?: BetLinks;
    partants: RacePartant[];
}
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
    type: string;
    status: string;
    chapeau: string;
    published_at: string;
    validated: boolean;
    validated_at: string;
    difficulty: number;
    uuid: string;
    bases: number[];
    belles_chances: number[];
    outsiders: number[];
    delaisses: number[];
    bet_links?: PronosticBetLinks;
    presentation?: string;
}
export interface InterviewPartantInfo {
    cheval: {
        nom_cheval: string;
        uuid: string;
    };
    num_partant: number;
    uuid: string;
}
export interface InterviewPartant {
    partant: InterviewPartantInfo;
    personne: string;
    note?: number;
    texte: string;
    uuid: string;
    subtitle?: string;
    short_title?: string;
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
    status: string;
    updated_at: string;
    uuid: string;
}
export interface InterneNotePartant {
    note_id_nav_partant: string;
    note_equidia: number;
    aptitudes: number;
    forme_cheval: number;
    conditions: number;
    tandem: number;
    apt_terrain: number;
    note_created_at: string;
    note_updated_at: string;
    bruits_ecuries?: number;
    pronos?: number;
}
export interface NoteResponseItem {
    num_partant: number;
    uuid: string;
    casaque: Casaque;
    cheval: {
        nom_cheval: string;
        musique: string;
        gains_carriere: number;
        uuid: string;
    };
    monte: {
        nom_monte: string;
        uuid: string;
    };
    entraineur: {
        nom_entraineur: string;
        uuid: string;
    };
    oeil_partant: string;
    oeil_partant_first_time: boolean;
    bonnet: boolean;
    attache_langue: boolean;
    deferrer_partant: string;
    deferrer_partant_first_time: boolean;
    statut_part: string;
    statut_part_pcc: string;
    num_place_arrivee?: string;
    texte_place_arrivee?: string;
    silks_path: string;
    gains_carriere: number;
    interne_note_partant: InterneNotePartant;
}
export type NoteResponse = NoteResponseItem[];
export interface RapportPariType {
    code_pari: string;
    titre: string;
    type_paris: string;
    bet_path?: string;
    odds_type?: string;
    weight?: number;
}
export interface RapportCombinaison {
    combinaison_rap_def: string;
    type_reserve_rap_def: string;
    gagnant?: string;
    gagnant_mb?: string;
    place?: string;
    place_mb?: string;
    sum_mises_gagn?: string;
    sum_mises_place?: string;
    sum_mises_gagn_type_res_rap_def?: string;
    sum_mises_place_type_res_rap_def?: string;
}
export interface RapportDefinitif {
    mise_base: string;
    code_pari_generique: string;
    audience_pari_course: string;
    numeros_gagnants_option: number[];
    combinaisons: RapportCombinaison[];
}
export interface RapportResponseItem {
    pari_type: RapportPariType;
    rapport_definitif?: RapportDefinitif;
}
export type RapportResponse = RapportResponseItem[];
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
    uuid: string;
    slug: string;
    type: string;
    comments_enabled: boolean;
    is_next_qrcode: boolean;
    image_a_la_une: ArticleImageALaUne;
    image_path: string;
    image_preview_path?: string;
    url_image_article: string;
    translations: {
        fr_FR: {
            title: string;
            slug: string;
            chapo: string;
            status: string;
            published_at: string;
        };
    };
    author: ArticleAuthor;
    tags: ArticleTag[];
    category: ArticleCategory;
}
export type ArticleResponse = ArticleResponseItem[];
export interface ReferenceRace {
    guid?: string;
    reunion: {
        lib_reunion: string;
        hippodrome: {
            name: string;
        };
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
    reference_message?: string;
    video_id?: string;
    photo_finish?: string;
    photo_gallery?: PhotoGalleryItem[];
    partants?: RacePartant[];
}
export interface ReferencesResponse {
    results: {
        references: ReferenceRace[];
        favoris: ReferenceRace[];
        most_common: ReferenceRace[];
        same_prix: ReferenceRace[];
        same_conditions: ReferenceRace[];
        best_associations: ReferenceRace[];
    };
}
export interface DailyPartant {
    statut_part: string;
    statut_part_pcc: string;
    num_place_arrivee?: string;
    num_partant: number;
}
export interface DailyCourse {
    etat_terrain?: string;
    libcourt_prix_course: string;
    lib_corde_course?: string;
    discipline: string;
    distance: number;
    is_quinte_plus: boolean;
    is_quinte_new: boolean;
    heure_depart_course: string;
    real_heure_course: string;
    num_course_pmu: number;
    nbdeclare_course: number;
    ind_cei: boolean;
    is_pmh: boolean;
    categ_course: string;
    montant_total_allocation: string;
    world_pool: boolean;
    guid: string;
    nb_partants: number;
    partants: DailyPartant[];
    type_statut_course_id: string;
    is_pick_five: boolean;
    groupe: string;
    is_groupe_i: boolean;
    is_tirelire: boolean;
    is_booster: boolean;
    booster?: string;
    description: string;
}
export interface DailyAudience {
    label: string;
    code: string;
}
export interface DailyFederation {
    name: string;
    nom_interne: string;
}
export interface DailyHippodrome {
    federation?: DailyFederation;
    name: string;
    code: string;
}
export interface DailyReunion {
    pays_site_reunion: string;
    lib_reunion: string;
    audience: DailyAudience;
    hippodrome: DailyHippodrome;
    date_reunion: string;
    num_reunion: number;
    specialite_reunion: string;
    type_reunion_id: string;
    heure_reunion: string;
    uuid: string;
    heure_reunion_racing: string;
    is_racing: boolean;
    heure_debut_reunion: string;
    heure_fin_reunion: string;
    courses_by_day: DailyCourse[];
    is_pmh: boolean;
    is_premium: boolean;
    is_csi: boolean;
    is_csi_pmu: boolean;
    disciplines: string[];
    is_canceled: boolean;
    is_quinte: boolean;
    is_quarte: boolean;
    flux_url: string;
    flux_type: string;
    flux_active: boolean;
}
export type DailyReunionResponse = DailyReunion[];
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
    id: number;
    num_partant: number;
    uuid: string;
}
export interface NotulePartant {
    partant: NotulePartantInfo;
    texte: string;
    impression_active: boolean;
    uuid: string;
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
    accroche: string;
    analyse: string;
    status: string;
    updated_at: string;
    uuid: string;
}
export interface InterneTrackingGps {
    tracking_id_nav_partant: string;
    vmax: number;
    temps_officiel: string;
    derniers_600m: string;
    derniers_200m: string;
    derniers_100m: string;
    distance_parcouru: number;
    pos_moy: number;
    pos_mi_course: number;
    parcouru_vs_1er: number;
    active: number;
    tracking_created_at: string;
    tracking_updated_at: string;
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
    vmax?: number;
    temps_officiel?: string;
    derniers_600m?: string;
    derniers_200m?: string;
    derniers_100m?: string;
    distance_parcouru?: number;
    pos_mi_course?: number;
    parcouru_vs_1er?: number;
    notule_partant_text?: string;
    notule_author_firstname?: string;
    notule_author_lastname?: string;
}
export interface HorseHistoryRace {
    etat_terrain: string;
    reunion: {
        lib_reunion: string;
        hippodrome: {
            name: string;
        };
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
export interface PariSimpleCheval {
    nom_cheval: string;
    intention_deferrer: string;
}
export interface PariSimpleHistoryPoint {
    rapp_evol: number;
    montant_enjeu_total: string;
}
export interface PariSimpleRunner {
    cheval: PariSimpleCheval;
    uuid: string;
    num_partant: number;
    channel: string;
    rapp_ref: number;
    rapp_evol: number;
    favori: boolean;
    tendance_signe: string;
    heure_rap_evol: string;
    history: PariSimpleHistoryPoint[];
}
export type PariSimpleResponse = PariSimpleRunner[];
export interface HorseStatsQuinte {
    nbPlace2a5: number;
    nbVictoire: number;
    nbCourse: number;
    percent: number;
}
export interface HorseStatsCarriereAll {
    nbPlace: number;
    nbVictoire: number;
    "4eOU5e": number;
    nbCourse: number;
    musique: string;
    calculatedMusique: string;
}
export interface HorseStatsCarriere {
    all: HorseStatsCarriereAll;
}
export interface HorseStatsResponse {
    gains_carriere: number;
    gains_victoire: number;
    quinte: HorseStatsQuinte;
    carriere: HorseStatsCarriere;
}
export interface HorseLastOrNextReunion {
    lib_reunion: string;
    hippodrome: {
        name: string;
    };
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
    enjeu_s_g: {
        montant: number;
    };
    type_statut_course_id: string;
    is_pick_five: boolean;
    groupe: string;
    selected_partant_info: any[];
    description: string;
}
export interface HorseLastOrNextPartant {
    monte_id: number;
    nom_monte: string;
    nom_entraineur: string;
    nom_pere: string;
    nom_mere: string;
    nom_proprietaire: string;
    id: number;
    pds_calc_hand_partant: number;
    pds_cond_monte_partant: number;
    deferrer_partant: string;
    num_partant: number;
    code_avis_entraineur: string | null;
    libelle_avis_entraineur: string | null;
    stats: any | null;
    attache_langue: number;
    bonnet: number;
    oeil_partant: string;
    reduction_km: number | null;
    temps_part: string | null;
    type_eng: string;
    num_place_arrivee: string | null;
    valeur: number;
    musique: string;
    dist_partant: number | null;
    interview_direct_des_pistes_author: string;
    interview_direct_des_pistes_pro: string;
    interview_direct_des_pistes: string;
    pronostic_analysis_pro: string;
    pronostic_analysis: string;
}
export interface HorseLastOrNextMusiques {
    cheval_calculated: string;
    trainer_calculated: string;
    monte_calculated: string;
}
export interface HorseLastOrNextResponse {
    type: string;
    race: HorseLastOrNextRace;
    partant: HorseLastOrNextPartant;
    musiques: HorseLastOrNextMusiques;
}
export interface HorseFicheLastCoteOff {
    channel: string;
    rapp_ref: number;
    rapp_evol: number;
    tendance_signe: string;
    heure_rap_evol: string;
}
export interface HorseFicheNotulePartant {
    texte: string;
    impression_active: boolean;
}
export interface HorseFichePartant {
    casaque: Casaque;
    cheval: {
        entraineur: {
            nom_entraineur: string;
        };
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
    entraineur: {
        nom_entraineur: string;
    };
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
    get_last_cote_off: HorseFicheLastCoteOff;
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
export interface PronoStatsResponse {
    [key: string]: any;
}
export interface StaticAnimationResponse {
    [key: string]: any;
}
export interface HorseFavoritesResponse {
    [key: string]: any;
}
//# sourceMappingURL=types.d.ts.map