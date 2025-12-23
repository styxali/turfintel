import { PrismaClient } from '@prisma/client';
import { IRaceRepository, RaceEntity } from '../../../domain/interfaces/IRaceRepository';
import { RaceParams } from '../../../domain/value-objects/RaceParams';
import { DatabaseError } from '../../../shared/errors/DomainErrors';
import * as Types from '../../../shared/types/types';

export class PrismaRaceRepository implements IRaceRepository {
  constructor(private prisma: PrismaClient) {}

  async findByGuid(guid: string): Promise<RaceEntity | null> {
    try {
      const race = await this.prisma.race.findUnique({
        where: { guid },
        include: {
          reunion: true,
        },
      });

      if (!race) return null;

      // Parse guid to extract date, reunion, course (format: YYYYMMDD_RX_CY)
      const guidParts = guid.split('_');
      const date = guidParts[0] ? `${guidParts[0].slice(0, 4)}-${guidParts[0].slice(4, 6)}-${guidParts[0].slice(6, 8)}` : '';
      const reunion = guidParts[1] || '';
      const course = guidParts[2] || '';

      return {
        id: race.id,
        guid: race.guid,
        uuid: race.uuid,
        date,
        reunion,
        course,
        numCoursePmu: race.numCoursePmu,
        libcourtPrixCourse: race.libcourtPrixCourse,
        discipline: race.discipline,
        distance: race.distance,
        etatTerrain: race.etatTerrain,
        heureDepartCourse: race.heureDepartCourse,
        isQuintePlus: race.isQuintePlus,
        tracked: race.tracked,
        raceDetails: race.raceDetailsJson ? JSON.parse(race.raceDetailsJson) : undefined,
        pronostic: race.pronosticJson ? JSON.parse(race.pronosticJson) : undefined,
        interviews: race.interviewsJson ? JSON.parse(race.interviewsJson) : undefined,
        notes: race.notesJson ? JSON.parse(race.notesJson) : undefined,
        tracking: race.trackingJson ? JSON.parse(race.trackingJson) : undefined,
        notule: race.notuleJson ? JSON.parse(race.notuleJson) : undefined,
        references: race.referencesJson ? JSON.parse(race.referencesJson) : undefined,
        rapports: race.rapportsJson ? JSON.parse(race.rapportsJson) : undefined,
        pariSimple: race.pariSimpleJson ? JSON.parse(race.pariSimpleJson) : undefined,
        createdAt: race.createdAt,
        updatedAt: race.updatedAt,
      };
    } catch (error: any) {
      throw new DatabaseError(`Failed to find race by guid: ${guid}`, error);
    }
  }

  async findByGuidWithPartants(guid: string): Promise<any | null> {
    try {
      const race = await this.prisma.race.findUnique({
        where: { guid },
        include: {
          reunion: {
            include: {
              hippodrome: true
            }
          },
          partants: {
            include: {
              horse: true,
              jockey: true,
              trainer: true
            }
          }
        },
      });

      if (!race) return null;

      return race;
    } catch (error: any) {
      throw new DatabaseError(`Failed to find race with partants by guid: ${guid}`, error);
    }
  }

  async findByParams(params: RaceParams): Promise<RaceEntity | null> {
    return this.findByGuid(params.toGuid());
  }

  async findUpcoming(date: string): Promise<RaceEntity[]> {
    try {
      const races = await this.prisma.race.findMany({
        where: {
          reunion: {
            dateReunion: date,
          },
        },
        include: {
          reunion: true,
        },
        orderBy: {
          heureDepartCourse: 'asc',
        },
      });

      // Map to RaceEntity with computed fields
      return races.map((race) => {
        const guidParts = race.guid.split('_');
        const raceDate = guidParts[0] ? `${guidParts[0].slice(0, 4)}-${guidParts[0].slice(4, 6)}-${guidParts[0].slice(6, 8)}` : '';
        const reunion = guidParts[1] || '';
        const course = guidParts[2] || '';

        return {
          id: race.id,
          guid: race.guid,
          uuid: race.uuid,
          date: raceDate,
          reunion,
          course,
          numCoursePmu: race.numCoursePmu,
          libcourtPrixCourse: race.libcourtPrixCourse,
          discipline: race.discipline,
          distance: race.distance,
          etatTerrain: race.etatTerrain,
          heureDepartCourse: race.heureDepartCourse,
          isQuintePlus: race.isQuintePlus,
          tracked: race.tracked,
          raceDetails: race.raceDetailsJson ? JSON.parse(race.raceDetailsJson) : undefined,
          pronostic: race.pronosticJson ? JSON.parse(race.pronosticJson) : undefined,
          interviews: race.interviewsJson ? JSON.parse(race.interviewsJson) : undefined,
          notes: race.notesJson ? JSON.parse(race.notesJson) : undefined,
          tracking: race.trackingJson ? JSON.parse(race.trackingJson) : undefined,
          notule: race.notuleJson ? JSON.parse(race.notuleJson) : undefined,
          references: race.referencesJson ? JSON.parse(race.referencesJson) : undefined,
          rapports: race.rapportsJson ? JSON.parse(race.rapportsJson) : undefined,
          pariSimple: race.pariSimpleJson ? JSON.parse(race.pariSimpleJson) : undefined,
          createdAt: race.createdAt,
          updatedAt: race.updatedAt,
        };
      });
    } catch (error: any) {
      throw new DatabaseError(`Failed to find upcoming races for date: ${date}`, error);
    }
  }

  async saveRaceDetails(raceDetails: Types.RaceDetailResponse): Promise<void> {
    try {
      const guid = this.buildGuid(raceDetails);
      
      // Override the guid in raceDetails to match our database format
      const correctedRaceDetails = {
        ...raceDetails,
        guid
      };

      // Upsert hippodrome
      const hippodrome = await this.prisma.hippodrome.upsert({
        where: { code: raceDetails.reunion.hippodrome.code || raceDetails.reunion.hippodrome.name },
        create: {
          code: raceDetails.reunion.hippodrome.code || raceDetails.reunion.hippodrome.name,
          name: raceDetails.reunion.hippodrome.name,
          countryCode: raceDetails.pays?.code,
        },
        update: {
          name: raceDetails.reunion.hippodrome.name,
          countryCode: raceDetails.pays?.code,
        },
      });

      // Upsert reunion
      const reunion = await this.prisma.reunion.upsert({
        where: {
          dateReunion_numReunion_libReunion: {
            dateReunion: raceDetails.reunion.date_reunion,
            numReunion: raceDetails.reunion.num_reunion,
            libReunion: raceDetails.reunion.lib_reunion,
          },
        },
        create: {
          dateReunion: raceDetails.reunion.date_reunion,
          numReunion: raceDetails.reunion.num_reunion,
          libReunion: raceDetails.reunion.lib_reunion,
          specialiteReunion: raceDetails.reunion.specialite_reunion,
          hippodromeId: hippodrome.id,
          meteoTemperature: raceDetails.reunion.meteo_temperature,
          meteoVentDirection: raceDetails.reunion.meteo_vent_direction?.label,
          meteoVentForce: raceDetails.reunion.meteo_vent_force,
          meteoNebulositeCode: raceDetails.reunion.meteo_nebulosite_code,
          meteoNebulositeLabel: raceDetails.reunion.meteo_nebulosite_libelle_court,
          heureReunionRacing: raceDetails.reunion.heure_reunion_racing,
          heureFinReunion: raceDetails.reunion.heure_fin_reunion,
          isPmh: raceDetails.reunion.is_pmh,
          isPremium: raceDetails.reunion.is_premium || false,
          fluxUrl: raceDetails.reunion.flux_url,
          fluxType: raceDetails.reunion.flux_type,
          fluxActive: raceDetails.reunion.flux_active || false,
        },
        update: {
          specialiteReunion: raceDetails.reunion.specialite_reunion,
          meteoTemperature: raceDetails.reunion.meteo_temperature,
          meteoVentDirection: raceDetails.reunion.meteo_vent_direction?.label,
          meteoVentForce: raceDetails.reunion.meteo_vent_force,
          fluxActive: raceDetails.reunion.flux_active || false,
        },
      });

      // Upsert race - check both guid and uuid to handle duplicates
      const existingRaceByGuid = await this.prisma.race.findUnique({ where: { guid } });
      const existingRaceByUuid = raceDetails.uuid ? await this.prisma.race.findUnique({ where: { uuid: raceDetails.uuid } }) : null;
      
      if (existingRaceByGuid) {
        // Update existing race by guid
        await this.prisma.race.update({
          where: { guid },
          data: {
            uuid: raceDetails.uuid,
            libcourtPrixCourse: raceDetails.libcourt_prix_course,
            etatTerrain: raceDetails.etat_terrain || 'N/A',
            realHeureCourse: raceDetails.real_heure_course,
            statutCourseId: raceDetails.statut_course_id,
            typeStatutCourseId: raceDetails.type_statut_course_id,
            tracked: raceDetails.tracked || false,
            photoFinish: raceDetails.photo_finish,
            raceDetailsJson: JSON.stringify(correctedRaceDetails),
          },
        });
      } else if (existingRaceByUuid) {
        // Race exists with same uuid but different guid - update it
        await this.prisma.race.update({
          where: { uuid: raceDetails.uuid },
          data: {
            guid,
            libcourtPrixCourse: raceDetails.libcourt_prix_course,
            etatTerrain: raceDetails.etat_terrain || 'N/A',
            realHeureCourse: raceDetails.real_heure_course,
            statutCourseId: raceDetails.statut_course_id,
            typeStatutCourseId: raceDetails.type_statut_course_id,
            tracked: raceDetails.tracked || false,
            photoFinish: raceDetails.photo_finish,
            raceDetailsJson: JSON.stringify(correctedRaceDetails),
          },
        });
      } else {
        // Create new race
        await this.prisma.race.create({
          data: {
            uuid: raceDetails.uuid,
            guid,
            numCoursePmu: raceDetails.num_course_pmu,
            reunionId: reunion.id,
            libcourtPrixCourse: raceDetails.libcourt_prix_course,
            liblongPrixCourse: raceDetails.liblong_prix_course,
            libCordeCourse: raceDetails.lib_corde_course,
            discipline: raceDetails.discipline,
            categCourse: raceDetails.categ_course || '',
            typeCourse: raceDetails.type_course,
            distance: raceDetails.distance,
            libParcoursCourse: raceDetails.lib_parcours_course,
            description: raceDetails.description,
            groupe: raceDetails.groupe,
            etatTerrain: raceDetails.etat_terrain || 'N/A',
            libPisteCourse: raceDetails.lib_piste_course,
            conditionsTxtCourse: raceDetails.conditions_txt_course,
            heureRelevePenetr: raceDetails.heure_releve_penetr,
            heureDepartCourse: raceDetails.heure_depart_course,
            realHeureCourse: raceDetails.real_heure_course,
            statutCourseId: raceDetails.statut_course_id,
            typeStatutCourseId: raceDetails.type_statut_course_id,
            nbdeclareCourse: raceDetails.nbdeclare_course,
            isQuintePlus: raceDetails.is_quinte_plus,
            isQuinteNew: raceDetails.is_quinte_new || false,
            isPickFive: raceDetails.is_pick_five,
            isPmh: raceDetails.is_pmh,
            isTirelire: raceDetails.is_tirelire || false,
            isBooster: raceDetails.is_booster || false,
            tracked: raceDetails.tracked || false,
            worldPool: raceDetails.world_pool || false,
            montantTotalAllocation: raceDetails.montant_total_allocation,
            enjeuSgMontant: raceDetails.enjeu_s_g?.montant,
            photoPath: raceDetails.photo_path,
            photoFinish: raceDetails.photo_finish,
            videoCourseId: raceDetails.video_course_id,
            videoCourseNom: raceDetails.video_course_nom,
            raceDetailsJson: JSON.stringify(correctedRaceDetails),
          },
        });
      }

      // Create horses and partants from race details
      if (raceDetails.partants && raceDetails.partants.length > 0) {
        for (const partant of raceDetails.partants) {
          // Upsert horse (only with fields available in API)
          await this.prisma.horse.upsert({
            where: { slug: partant.cheval.slug },
            create: {
              uuid: partant.cheval.uuid,
              slug: partant.cheval.slug,
              nomCheval: partant.cheval.nom_cheval,
              sexeCheval: partant.cheval.sexe_cheval,
              ageCheval: partant.cheval.age_cheval,
              musique: partant.cheval.musique || '',
              gainsCarriere: partant.cheval.gains_carriere || 0,
            },
            update: {
              nomCheval: partant.cheval.nom_cheval,
              ageCheval: partant.cheval.age_cheval,
              musique: partant.cheval.musique || '',
              gainsCarriere: partant.cheval.gains_carriere || 0,
            },
          });

          // Upsert jockey (generate UUID from name if not available)
          const jockeyUuid = `jockey_${partant.monte.nom_monte.toLowerCase().replace(/\s+/g, '_')}`;
          const jockey = await this.prisma.jockey.upsert({
            where: { uuid: jockeyUuid },
            create: {
              uuid: jockeyUuid,
              nomMonte: partant.monte.nom_monte,
            },
            update: {
              nomMonte: partant.monte.nom_monte,
            },
          });

          // Upsert trainer (generate UUID from name if not available)
          const trainerUuid = `trainer_${partant.entraineur.nom_entraineur.toLowerCase().replace(/\s+/g, '_')}`;
          const trainer = await this.prisma.trainer.upsert({
            where: { uuid: trainerUuid },
            create: {
              uuid: trainerUuid,
              nomEntraineur: partant.entraineur.nom_entraineur,
            },
            update: {
              nomEntraineur: partant.entraineur.nom_entraineur,
            },
          });

          // Get race and horse IDs
          const race = await this.prisma.race.findUnique({
            where: { guid },
            select: { id: true },
          });

          const horse = await this.prisma.horse.findUnique({
            where: { slug: partant.cheval.slug },
            select: { id: true },
          });

          if (race && horse) {
            // Upsert partant (only with fields available in schema)
            await this.prisma.partant.upsert({
              where: {
                raceId_numPartant: {
                  raceId: race.id,
                  numPartant: partant.num_partant,
                },
              },
              create: {
                raceId: race.id,
                horseId: horse.id,
                jockeyId: jockey.id,
                trainerId: trainer.id,
                numPartant: partant.num_partant,
                placeCordepartant: partant.place_corde_partant || '',
                pdsCalcHandPartant: partant.pds_calc_hand_partant || 0,
                pdsCondMontePartant: partant.pds_cond_monte_partant || 0,
                oeilPartant: partant.oeil_partant,
                oeilPartantFirstTime: partant.oeil_partant_first_time,
                bonnet: partant.bonnet,
                attacheLangue: partant.attache_langue,
                deferrerPartant: partant.deferrer_partant,
                deferrerPartantFirstTime: partant.deferrer_partant_first_time,
                statutPart: partant.statut_part || 'NP',
                statutPartPcc: partant.statut_part_pcc || 'NP',
                typeEng: partant.type_eng || '',
                silksPath: partant.silks_path || '',
              },
              update: {
                placeCordepartant: partant.place_corde_partant || '',
                pdsCalcHandPartant: partant.pds_calc_hand_partant || 0,
                pdsCondMontePartant: partant.pds_cond_monte_partant || 0,
                oeilPartant: partant.oeil_partant,
                oeilPartantFirstTime: partant.oeil_partant_first_time,
                bonnet: partant.bonnet,
                attacheLangue: partant.attache_langue,
                deferrerPartant: partant.deferrer_partant,
                deferrerPartantFirstTime: partant.deferrer_partant_first_time,
                statutPart: partant.statut_part || 'NP',
                statutPartPcc: partant.statut_part_pcc || 'NP',
              },
            });
          }
        }
        console.log(`[DB] Created ${raceDetails.partants.length} horses and partants for race: ${guid}`);
      }

      console.log(`[DB] Saved race details: ${guid}`);
    } catch (error: any) {
      throw new DatabaseError('Failed to save race details', error);
    }
  }

  async savePronostic(guid: string, pronostic: Types.PronosticResponse): Promise<void> {
    try {
      const race = await this.prisma.race.findUnique({ where: { guid } });
      if (!race) {
        console.log(`[DB] Race ${guid} not found, skipping pronostic save`);
        return;
      }
      
      await this.prisma.race.update({
        where: { guid },
        data: {
          pronosticJson: JSON.stringify(pronostic),
        },
      });

      console.log(`[DB] Saved pronostic for race: ${guid}`);
    } catch (error: any) {
      throw new DatabaseError(`Failed to save pronostic for race: ${guid}`, error);
    }
  }

  async saveInterviews(guid: string, interviews: Types.InterviewResponse): Promise<void> {
    try {
      const race = await this.prisma.race.findUnique({ where: { guid } });
      if (!race) {
        console.log(`[DB] Race ${guid} not found, skipping interview save`);
        return;
      }
      
      await this.prisma.race.update({
        where: { guid },
        data: {
          interviewsJson: JSON.stringify(interviews),
        },
      });

      console.log(`[DB] Saved interviews for race: ${guid}`);
    } catch (error: any) {
      throw new DatabaseError(`Failed to save interviews for race: ${guid}`, error);
    }
  }

  async saveNotes(guid: string, notes: Types.NoteResponse): Promise<void> {
    try {
      const race = await this.prisma.race.findUnique({ where: { guid } });
      if (!race) {
        console.log(`[DB] Race ${guid} not found, skipping notes save`);
        return;
      }
      
      await this.prisma.race.update({
        where: { guid },
        data: {
          notesJson: JSON.stringify(notes),
        },
      });

      console.log(`[DB] Saved notes for race: ${guid}`);
    } catch (error: any) {
      throw new DatabaseError(`Failed to save notes for race: ${guid}`, error);
    }
  }

  async saveTracking(guid: string, tracking: Types.TrackingResponse): Promise<void> {
    try {
      const race = await this.prisma.race.findUnique({ where: { guid } });
      if (!race) {
        console.log(`[DB] Race ${guid} not found, skipping tracking save`);
        return;
      }
      
      await this.prisma.race.update({
        where: { guid },
        data: {
          trackingJson: JSON.stringify(tracking),
        },
      });

      console.log(`[DB] Saved tracking for race: ${guid}`);
    } catch (error: any) {
      throw new DatabaseError(`Failed to save tracking for race: ${guid}`, error);
    }
  }

  async saveNotule(guid: string, notule: Types.NotuleResponse): Promise<void> {
    try {
      const race = await this.prisma.race.findUnique({ where: { guid } });
      if (!race) {
        console.log(`[DB] Race ${guid} not found, skipping notule save`);
        return;
      }
      
      await this.prisma.race.update({
        where: { guid },
        data: {
          notuleJson: JSON.stringify(notule),
        },
      });

      console.log(`[DB] Saved notule for race: ${guid}`);
    } catch (error: any) {
      throw new DatabaseError(`Failed to save notule for race: ${guid}`, error);
    }
  }

  async saveReferences(guid: string, references: Types.ReferencesResponse): Promise<void> {
    try {
      await this.prisma.race.update({
        where: { guid },
        data: {
          referencesJson: JSON.stringify(references),
        },
      });

      console.log(`[DB] Saved references for race: ${guid}`);
    } catch (error: any) {
      throw new DatabaseError(`Failed to save references for race: ${guid}`, error);
    }
  }

  async saveRapports(guid: string, rapports: Types.RapportResponse): Promise<void> {
    try {
      await this.prisma.race.update({
        where: { guid },
        data: {
          rapportsJson: JSON.stringify(rapports),
        },
      });

      console.log(`[DB] Saved rapports for race: ${guid}`);
    } catch (error: any) {
      throw new DatabaseError(`Failed to save rapports for race: ${guid}`, error);
    }
  }

  async savePariSimple(guid: string, pariSimple: Types.PariSimpleResponse): Promise<void> {
    try {
      const race = await this.prisma.race.findUnique({ where: { guid } });
      if (!race) {
        console.log(`[DB] Race ${guid} not found, skipping pari simple save`);
        return;
      }
      
      await this.prisma.race.update({
        where: { guid },
        data: {
          pariSimpleJson: JSON.stringify(pariSimple),
        },
      });

      console.log(`[DB] Saved pari simple for race: ${guid}`);
    } catch (error: any) {
      throw new DatabaseError(`Failed to save pari simple for race: ${guid}`, error);
    }
  }

  async hasPronostic(guid: string): Promise<boolean> {
    try {
      const race = await this.prisma.race.findUnique({
        where: { guid },
        select: { pronosticJson: true },
      });
      return !!race?.pronosticJson;
    } catch (error: any) {
      return false;
    }
  }

  async hasTracking(guid: string): Promise<boolean> {
    try {
      const race = await this.prisma.race.findUnique({
        where: { guid },
        select: { trackingJson: true },
      });
      return !!race?.trackingJson;
    } catch (error: any) {
      return false;
    }
  }

  // Helper method to build GUID from race details
  private buildGuid(raceDetails: Types.RaceDetailResponse): string {
    const date = raceDetails.reunion.date_reunion.replace(/-/g, '');
    const reunion = `R${raceDetails.reunion.num_reunion}`;
    const course = `C${raceDetails.num_course_pmu}`;
    return `${date}_${reunion}_${course}`;
  }
}

// REMOVE ALL THE OLD SAVE METHODS BELOW THIS LINE
/*
  async savePronostic(guid: string, pronostic: Types.PronosticResponse): Promise<void> {
    try {
      const race = await this.findByGuid(guid);
      if (!race) {
        console.warn(`[DB] Race not found for pronostic: ${guid}`);
        return;
      }

      await this.prisma.pronostic.upsert({
        where: { raceId: race.id },
        create: {
          raceId: race.id,
          uuid: pronostic.uuid,
          type: pronostic.type,
          status: pronostic.status,
          difficulty: pronostic.difficulty,
          validated: pronostic.validated,
          chapeau: pronostic.chapeau,
          presentation: pronostic.presentation,
          publishedAt: pronostic.published_at,
          validatedAt: pronostic.validated_at,
          creatorFirstname: pronostic.creator.firstname,
          creatorLastname: pronostic.creator.lastname,
          creatorPhotoUrl: pronostic.creator.photo_url,
          creatorIsJournalist: pronostic.creator.is_journalist,
          creatorClassKey: pronostic.creator.class_key,
          creatorUuid: pronostic.creator.uuid,
          creatorSlug: pronostic.creator.slug,
          bases: JSON.stringify(pronostic.bases),
          bellesChances: JSON.stringify(pronostic.belles_chances),
          outsiders: JSON.stringify(pronostic.outsiders),
          delaisses: JSON.stringify(pronostic.delaisses),
          betLinks: pronostic.bet_links ? JSON.stringify(pronostic.bet_links) : null,
        },
        update: {
          status: pronostic.status,
          validated: pronostic.validated,
          validatedAt: pronostic.validated_at,
        },
      });

      console.log(`[DB] Saved pronostic for race: ${guid}`);
    } catch (error: any) {
      throw new DatabaseError(`Failed to save pronostic for race: ${guid}`, error);
    }
  }

  async saveInterviews(guid: string, interviews: Types.InterviewResponse): Promise<void> {
    try {
      const race = await this.findByGuid(guid);
      if (!race) {
        console.warn(`[DB] Race not found for interviews: ${guid}`);
        return;
      }

      // Save interview set
      await this.prisma.interviewSet.upsert({
        where: { raceId: race.id },
        create: {
          raceId: race.id,
          uuid: interviews.uuid,
          authorFirstname: interviews.author.firstname,
          authorLastname: interviews.author.lastname,
          authorPhotoUrl: interviews.author.photo_url,
          authorIsJournalist: interviews.author.is_journalist,
          authorClassKey: interviews.author.class_key,
          authorUuid: interviews.author.uuid,
          authorSlug: interviews.author.slug,
          status: interviews.status,
          updatedAtApi: interviews.updated_at,
        },
        update: {
          status: interviews.status,
          updatedAtApi: interviews.updated_at,
        },
      });

      console.log(`[DB] Saved interviews for race: ${guid}`);
    } catch (error: any) {
      throw new DatabaseError(`Failed to save interviews for race: ${guid}`, error);
    }
  }

  async saveNotes(guid: string, notes: Types.NoteResponse): Promise<void> {
    try {
      const race = await this.findByGuid(guid);
      if (!race) {
        console.warn(`[DB] Race not found for notes: ${guid}`);
        return;
      }

      console.log(`[DB] Saved ${notes.length} notes for race: ${guid}`);
    } catch (error: any) {
      throw new DatabaseError(`Failed to save notes for race: ${guid}`, error);
    }
  }

  async saveTracking(guid: string, tracking: Types.TrackingResponse): Promise<void> {
    try {
      const race = await this.findByGuid(guid);
      if (!race) {
        console.warn(`[DB] Race not found for tracking: ${guid}`);
        return;
      }

      // Save tracking data for each horse
      for (const track of tracking) {
        await this.prisma.tracking.upsert({
          where: {
            raceId_numPartant: {
              raceId: race.id,
              numPartant: track.num_partant,
            },
          },
          create: {
            raceId: race.id,
            trackingIdNavPartant: track.interne_tracking_gps.tracking_id_nav_partant,
            numPartant: track.num_partant,
            chevalNom: track.cheval.nom_cheval,
            chevalUuid: track.cheval.uuid,
            numPlaceArrivee: track.num_place_arrivee,
            textePlaceArrivee: track.texte_place_arrivee,
            vmax: track.interne_tracking_gps.vmax,
            tempsOfficiel: track.interne_tracking_gps.temps_officiel,
            derniers600m: track.interne_tracking_gps.derniers_600m,
            derniers200m: track.interne_tracking_gps.derniers_200m,
            derniers100m: track.interne_tracking_gps.derniers_100m,
            posMoy: track.interne_tracking_gps.pos_moy,
            posMiCourse: track.interne_tracking_gps.pos_mi_course,
            distanceParcouru: track.interne_tracking_gps.distance_parcouru,
            parcouruVs1er: track.interne_tracking_gps.parcouru_vs_1er,
            active: track.interne_tracking_gps.active,
            trackingCreatedAt: track.interne_tracking_gps.tracking_created_at,
            trackingUpdatedAt: track.interne_tracking_gps.tracking_updated_at,
          },
          update: {
            vmax: track.interne_tracking_gps.vmax,
            tempsOfficiel: track.interne_tracking_gps.temps_officiel,
            derniers600m: track.interne_tracking_gps.derniers_600m,
            derniers200m: track.interne_tracking_gps.derniers_200m,
            derniers100m: track.interne_tracking_gps.derniers_100m,
            active: track.interne_tracking_gps.active,
            trackingUpdatedAt: track.interne_tracking_gps.tracking_updated_at,
          },
        });
      }

      console.log(`[DB] Saved ${tracking.length} tracking records for race: ${guid}`);
    } catch (error: any) {
      throw new DatabaseError(`Failed to save tracking for race: ${guid}`, error);
    }
  }

  async saveNotule(guid: string, notule: Types.NotuleResponse): Promise<void> {
    try {
      const race = await this.findByGuid(guid);
      if (!race) {
        console.warn(`[DB] Race not found for notule: ${guid}`);
        return;
      }

      await this.prisma.notule.upsert({
        where: { raceId: race.id },
        create: {
          raceId: race.id,
          uuid: notule.uuid,
          accroche: notule.accroche,
          analyse: notule.analyse,
          authorFirstname: notule.author.firstname,
          authorLastname: notule.author.lastname,
          authorPhotoUrl: notule.author.photo_url,
          authorIsJournalist: notule.author.is_journalist,
          authorClassKey: notule.author.class_key,
          authorUuid: notule.author.uuid,
          authorSlug: notule.author.slug,
          status: notule.status,
          updatedAtApi: notule.updated_at,
        },
        update: {
          accroche: notule.accroche,
          analyse: notule.analyse,
          status: notule.status,
          updatedAtApi: notule.updated_at,
        },
      });

      console.log(`[DB] Saved notule for race: ${guid}`);
    } catch (error: any) {
      throw new DatabaseError(`Failed to save notule for race: ${guid}`, error);
    }
  }

  async saveReferences(guid: string, references: Types.ReferencesResponse): Promise<void> {
    try {
      const race = await this.findByGuid(guid);
      if (!race) {
        console.warn(`[DB] Race not found for references: ${guid}`);
        return;
      }

      console.log(`[DB] Saved references for race: ${guid}`);
    } catch (error: any) {
      throw new DatabaseError(`Failed to save references for race: ${guid}`, error);
    }
  }

  async saveRapports(guid: string, rapports: Types.RapportResponse): Promise<void> {
    try {
      const race = await this.findByGuid(guid);
      if (!race) {
        console.warn(`[DB] Race not found for rapports: ${guid}`);
        return;
      }

      console.log(`[DB] Saved ${rapports.length} rapports for race: ${guid}`);
    } catch (error: any) {
      throw new DatabaseError(`Failed to save rapports for race: ${guid}`, error);
    }
  }

  async savePariSimple(guid: string, pariSimple: Types.PariSimpleResponse): Promise<void> {
    try {
      const race = await this.findByGuid(guid);
      if (!race) {
        console.warn(`[DB] Race not found for pari simple: ${guid}`);
        return;
      }

      // Save live odds for each horse
      for (const runner of pariSimple) {
        await this.prisma.pariSimple.upsert({
          where: {
            raceId_numPartant: {
              raceId: race.id,
              numPartant: runner.num_partant,
            },
          },
          create: {
            raceId: race.id,
            chevalNom: runner.cheval.nom_cheval,
            chevalUuid: runner.uuid,
            numPartant: runner.num_partant,
            intentionDeferrer: runner.cheval.intention_deferrer,
            channel: runner.channel,
            rappRef: runner.rapp_ref,
            rappEvol: runner.rapp_evol,
            favori: runner.favori,
            tendanceSigne: runner.tendance_signe,
            heureRapEvol: runner.heure_rap_evol,
            history: JSON.stringify(runner.history),
          },
          update: {
            rappEvol: runner.rapp_evol,
            favori: runner.favori,
            tendanceSigne: runner.tendance_signe,
            heureRapEvol: runner.heure_rap_evol,
            history: JSON.stringify(runner.history),
          },
        });
      }

      console.log(`[DB] Saved ${pariSimple.length} pari simple records for race: ${guid}`);
    } catch (error: any) {
      throw new DatabaseError(`Failed to save pari simple for race: ${guid}`, error);
    }
  }

  async hasPronostic(guid: string): Promise<boolean> {
    try {
      const race = await this.findByGuid(guid);
      if (!race) return false;

      const count = await this.prisma.pronostic.count({
        where: { raceId: race.id },
      });

      return count > 0;
    } catch (error: any) {
      return false;
    }
  }

  async hasTracking(guid: string): Promise<boolean> {
    try {
      const race = await this.findByGuid(guid);
      if (!race) return false;

      const count = await this.prisma.tracking.count({
        where: { raceId: race.id },
      });

      return count > 0;
    } catch (error: any) {
      return false;
    }
  }

  private buildGuid(raceDetails: Types.RaceDetailResponse): string {
    const date = raceDetails.reunion.date_reunion.replace(/-/g, '');
    const reunion = `R${raceDetails.reunion.num_reunion}`;
    const course = `C${raceDetails.num_course_pmu}`;
    return `${date}_${reunion}_${course}`;
  }
}
*/