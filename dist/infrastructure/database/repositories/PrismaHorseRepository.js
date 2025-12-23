"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaHorseRepository = void 0;
const DomainErrors_1 = require("../../../shared/errors/DomainErrors");
class PrismaHorseRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findBySlug(slug) {
        try {
            const horse = await this.prisma.horse.findUnique({
                where: { slug },
            });
            if (!horse)
                return null;
            return {
                id: horse.id,
                uuid: horse.uuid,
                slug: horse.slug,
                nomCheval: horse.nomCheval,
                sexeCheval: horse.sexeCheval,
                ageCheval: horse.ageCheval,
                musique: horse.musique,
                gainsCarriere: horse.gainsCarriere,
                history: horse.historyJson ? JSON.parse(horse.historyJson) : undefined,
                stats: horse.statsJson ? JSON.parse(horse.statsJson) : undefined,
                createdAt: horse.createdAt,
                updatedAt: horse.updatedAt,
            };
        }
        catch (error) {
            throw new DomainErrors_1.DatabaseError(`Failed to find horse by slug: ${slug}`, error);
        }
    }
    async findByUuid(uuid) {
        try {
            const horse = await this.prisma.horse.findUnique({
                where: { uuid },
            });
            if (!horse)
                return null;
            return {
                id: horse.id,
                uuid: horse.uuid,
                slug: horse.slug,
                nomCheval: horse.nomCheval,
                sexeCheval: horse.sexeCheval,
                ageCheval: horse.ageCheval,
                musique: horse.musique,
                gainsCarriere: horse.gainsCarriere,
                history: horse.historyJson ? JSON.parse(horse.historyJson) : undefined,
                stats: horse.statsJson ? JSON.parse(horse.statsJson) : undefined,
                createdAt: horse.createdAt,
                updatedAt: horse.updatedAt,
            };
        }
        catch (error) {
            throw new DomainErrors_1.DatabaseError(`Failed to find horse by uuid: ${uuid}`, error);
        }
    }
    async saveHorse(horseData) {
        try {
            await this.prisma.horse.upsert({
                where: { uuid: horseData.uuid },
                create: {
                    uuid: horseData.uuid,
                    slug: horseData.slug,
                    nomCheval: horseData.nomCheval,
                    sexeCheval: horseData.sexeCheval,
                    ageCheval: horseData.ageCheval,
                    musique: horseData.musique,
                    shortMusique: horseData.musique.substring(0, 10),
                    gainsCarriere: horseData.gainsCarriere,
                },
                update: {
                    nomCheval: horseData.nomCheval,
                    ageCheval: horseData.ageCheval,
                    musique: horseData.musique,
                    shortMusique: horseData.musique.substring(0, 10),
                    gainsCarriere: horseData.gainsCarriere,
                },
            });
            console.log(`[DB] Saved horse: ${horseData.slug}`);
        }
        catch (error) {
            throw new DomainErrors_1.DatabaseError(`Failed to save horse: ${horseData.slug}`, error);
        }
    }
    async saveHistory(horseSlug, history) {
        try {
            await this.prisma.horse.update({
                where: { slug: horseSlug },
                data: {
                    historyJson: JSON.stringify(history),
                },
            });
            console.log(`[DB] Saved history for horse: ${horseSlug}`);
        }
        catch (error) {
            throw new DomainErrors_1.DatabaseError(`Failed to save history for horse: ${horseSlug}`, error);
        }
    }
    async saveStats(horseSlug, stats) {
        try {
            await this.prisma.horse.update({
                where: { slug: horseSlug },
                data: {
                    statsJson: JSON.stringify(stats),
                },
            });
            console.log(`[DB] Saved stats for horse: ${horseSlug}`);
        }
        catch (error) {
            throw new DomainErrors_1.DatabaseError(`Failed to save stats for horse: ${horseSlug}`, error);
        }
    }
    async hasHistory(horseSlug) {
        try {
            const horse = await this.prisma.horse.findUnique({
                where: { slug: horseSlug },
                select: { historyJson: true },
            });
            return !!horse?.historyJson;
        }
        catch (error) {
            return false;
        }
    }
    async hasStats(horseSlug) {
        try {
            const horse = await this.prisma.horse.findUnique({
                where: { slug: horseSlug },
                select: { statsJson: true },
            });
            return !!horse?.statsJson;
        }
        catch (error) {
            return false;
        }
    }
}
exports.PrismaHorseRepository = PrismaHorseRepository;
// REMOVE ALL OLD METHODS BELOW
/*
  async saveHistory(horseSlug: string, history: Types.HorseHistoryResponse): Promise<void> {
    try:
      const horse = await this.findBySlug(horseSlug);
      if (!horse) {
        console.warn(`[DB] Horse not found for history: ${horseSlug}`);
        return;
      }

      // Save each race in history
      for (const race of history.results) {
        await this.prisma.horseHistory.upsert({
          where: {
            horseId_raceGuid: {
              horseId: horse.id,
              raceGuid: race.guid,
            },
          },
          create: {
            horseId: horse.id,
            raceGuid: race.guid,
            raceUuid: race.uuid,
            dateReunion: race.reunion.date_reunion,
            libReunion: race.reunion.lib_reunion,
            hippodromeName: race.reunion.hippodrome.name,
            numReunion: race.reunion.num_reunion,
            numCoursePmu: race.num_course_pmu,
            libcourtPrixCourse: race.libcourt_prix_course,
            liblongPrixCourse: race.liblong_prix_course,
            discipline: race.discipline,
            categCourse: race.categ_course,
            typeCourse: race.type_course,
            distance: race.distance,
            etatTerrain: race.etat_terrain,
            montantTotalAllocation: race.montant_total_allocation,
            numPlaceArrivee: race.selected_partant_info.num_place_arrivee,
            textePlaceArrivee: race.selected_partant_info.texte_place_arrivee,
            pdsCalcHandPartant: race.selected_partant_info.pds_calc_hand_partant,
            oeilPartant: race.selected_partant_info.oeil_partant,
            tempsPart: race.selected_partant_info.temps_part,
            nomMonte: race.selected_partant_info.nom_monte,
            valeur: race.selected_partant_info.valeur,
            musique: race.selected_partant_info.musique,
            vmax: race.selected_partant_info.vmax,
            tempsOfficiel: race.selected_partant_info.temps_officiel,
            derniers600m: race.selected_partant_info.derniers_600m,
            derniers200m: race.selected_partant_info.derniers_200m,
            derniers100m: race.selected_partant_info.derniers_100m,
            distanceParcouru: race.selected_partant_info.distance_parcouru,
            posMiCourse: race.selected_partant_info.pos_mi_course,
            parcouruVs1er: race.selected_partant_info.parcouru_vs_1er,
            notulePartantText: race.selected_partant_info.notule_partant_text,
            notuleAuthorFirstname: race.selected_partant_info.notule_author_firstname,
            notuleAuthorLastname: race.selected_partant_info.notule_author_lastname,
          },
          update: {
            numPlaceArrivee: race.selected_partant_info.num_place_arrivee,
            textePlaceArrivee: race.selected_partant_info.texte_place_arrivee,
            tempsPart: race.selected_partant_info.temps_part,
            vmax: race.selected_partant_info.vmax,
            tempsOfficiel: race.selected_partant_info.temps_officiel,
          },
        });
      }

      console.log(`[DB] Saved ${history.results.length} history records for horse: ${horseSlug}`);
    } catch (error: any) {
      throw new DatabaseError(`Failed to save history for horse: ${horseSlug}`, error);
    }
  }

  async saveStats(horseSlug: string, stats: Types.HorseStatsResponse): Promise<void> {
    try {
      const horse = await this.findBySlug(horseSlug);
      if (!horse) {
        console.warn(`[DB] Horse not found for stats: ${horseSlug}`);
        return;
      }

      await this.prisma.horseStats.upsert({
        where: { horseId: horse.id },
        create: {
          horseId: horse.id,
          gainsCarriere: stats.gains_carriere,
          gainsVictoire: stats.gains_victoire,
          quinteNbPlace2a5: stats.quinte.nbPlace2a5,
          quinteNbVictoire: stats.quinte.nbVictoire,
          quinteNbCourse: stats.quinte.nbCourse,
          quintePercent: stats.quinte.percent,
          carriereNbPlace: stats.carriere.all.nbPlace,
          carriereNbVictoire: stats.carriere.all.nbVictoire,
          carriere4eOu5e: stats.carriere.all['4eOU5e'],
          carriereNbCourse: stats.carriere.all.nbCourse,
          carriereMusique: stats.carriere.all.musique,
          carriereCalculatedMusique: stats.carriere.all.calculatedMusique,
        },
        update: {
          gainsCarriere: stats.gains_carriere,
          gainsVictoire: stats.gains_victoire,
          quinteNbPlace2a5: stats.quinte.nbPlace2a5,
          quinteNbVictoire: stats.quinte.nbVictoire,
          quinteNbCourse: stats.quinte.nbCourse,
          quintePercent: stats.quinte.percent,
          carriereNbPlace: stats.carriere.all.nbPlace,
          carriereNbVictoire: stats.carriere.all.nbVictoire,
          carriere4eOu5e: stats.carriere.all['4eOU5e'],
          carriereNbCourse: stats.carriere.all.nbCourse,
          carriereMusique: stats.carriere.all.musique,
          carriereCalculatedMusique: stats.carriere.all.calculatedMusique,
        },
      });

      console.log(`[DB] Saved stats for horse: ${horseSlug}`);
    } catch (error: any) {
      throw new DatabaseError(`Failed to save stats for horse: ${horseSlug}`, error);
    }
  }

  async hasHistory(horseSlug: string): Promise<boolean> {
    try {
      const horse = await this.findBySlug(horseSlug);
      if (!horse) return false;

      const count = await this.prisma.horseHistory.count({
        where: { horseId: horse.id },
      });

      return count > 0;
    } catch (error: any) {
      return false;
    }
  }

  async hasStats(horseSlug: string): Promise<boolean> {
    try {
      const horse = await this.findBySlug(horseSlug);
      if (!horse) return false;

      const count = await this.prisma.horseStats.count({
        where: { horseId: horse.id },
      });

      return count > 0;
    } catch (error: any) {
      return false;
    }
  }
}
*/ 
//# sourceMappingURL=PrismaHorseRepository.js.map