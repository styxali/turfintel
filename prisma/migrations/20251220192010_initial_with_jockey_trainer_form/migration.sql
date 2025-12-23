-- CreateTable
CREATE TABLE "Hippodrome" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Reunion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dateReunion" TEXT NOT NULL,
    "numReunion" INTEGER NOT NULL,
    "libReunion" TEXT NOT NULL,
    "specialiteReunion" TEXT NOT NULL,
    "hippodromeId" TEXT NOT NULL,
    "meteoTemperature" TEXT,
    "meteoVentDirection" TEXT,
    "meteoVentForce" TEXT,
    "meteoNebulositeCode" TEXT,
    "meteoNebulositeLabel" TEXT,
    "heureReunionRacing" TEXT,
    "heureFinReunion" TEXT,
    "isPmh" BOOLEAN NOT NULL DEFAULT false,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "fluxUrl" TEXT,
    "fluxType" TEXT,
    "fluxActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reunion_hippodromeId_fkey" FOREIGN KEY ("hippodromeId") REFERENCES "Hippodrome" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Race" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uuid" TEXT NOT NULL,
    "guid" TEXT NOT NULL,
    "numCoursePmu" INTEGER NOT NULL,
    "reunionId" TEXT NOT NULL,
    "libcourtPrixCourse" TEXT NOT NULL,
    "liblongPrixCourse" TEXT,
    "libCordeCourse" TEXT,
    "discipline" TEXT NOT NULL,
    "categCourse" TEXT NOT NULL,
    "typeCourse" TEXT,
    "distance" INTEGER NOT NULL,
    "libParcoursCourse" TEXT,
    "description" TEXT,
    "groupe" TEXT,
    "etatTerrain" TEXT NOT NULL,
    "libPisteCourse" TEXT,
    "conditionsTxtCourse" TEXT NOT NULL DEFAULT '',
    "heureRelevePenetr" TEXT,
    "heureDepartCourse" TEXT NOT NULL,
    "realHeureCourse" TEXT,
    "statutCourseId" INTEGER,
    "typeStatutCourseId" TEXT,
    "nbdeclareCourse" INTEGER,
    "isQuintePlus" BOOLEAN NOT NULL DEFAULT false,
    "isQuinteNew" BOOLEAN NOT NULL DEFAULT false,
    "isPickFive" BOOLEAN NOT NULL DEFAULT false,
    "isPmh" BOOLEAN NOT NULL DEFAULT false,
    "isTirelire" BOOLEAN NOT NULL DEFAULT false,
    "isBooster" BOOLEAN NOT NULL DEFAULT false,
    "tracked" BOOLEAN NOT NULL DEFAULT false,
    "worldPool" BOOLEAN NOT NULL DEFAULT false,
    "montantTotalAllocation" TEXT,
    "enjeuSgMontant" INTEGER,
    "photoPath" TEXT,
    "photoFinish" TEXT,
    "videoCourseId" TEXT,
    "videoCourseNom" TEXT,
    "raceDetailsJson" TEXT,
    "pronosticJson" TEXT,
    "interviewsJson" TEXT,
    "notesJson" TEXT,
    "trackingJson" TEXT,
    "notuleJson" TEXT,
    "referencesJson" TEXT,
    "rapportsJson" TEXT,
    "pariSimpleJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Race_reunionId_fkey" FOREIGN KEY ("reunionId") REFERENCES "Reunion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Horse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uuid" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nomCheval" TEXT NOT NULL,
    "sexeCheval" TEXT NOT NULL,
    "ageCheval" INTEGER NOT NULL,
    "musique" TEXT NOT NULL,
    "shortMusique" TEXT,
    "gainsCarriere" INTEGER NOT NULL,
    "chevalCalculated" TEXT,
    "trainerCalculated" TEXT,
    "monteCalculated" TEXT,
    "historyJson" TEXT,
    "statsJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "HorseStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "horseId" TEXT NOT NULL,
    "gainsCarriere" INTEGER NOT NULL,
    "gainsVictoire" INTEGER NOT NULL,
    "quinteNbPlace2a5" INTEGER NOT NULL,
    "quinteNbVictoire" INTEGER NOT NULL,
    "quinteNbCourse" INTEGER NOT NULL,
    "quintePercent" INTEGER NOT NULL,
    "carriereNbPlace" INTEGER NOT NULL,
    "carriereNbVictoire" INTEGER NOT NULL,
    "carriere4eOu5e" INTEGER NOT NULL,
    "carriereNbCourse" INTEGER NOT NULL,
    "carriereMusique" TEXT NOT NULL,
    "carriereCalculatedMusique" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HorseStats_horseId_fkey" FOREIGN KEY ("horseId") REFERENCES "Horse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Trainer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uuid" TEXT NOT NULL,
    "nomEntraineur" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Jockey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uuid" TEXT NOT NULL,
    "nomMonte" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Partant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "raceId" TEXT NOT NULL,
    "horseId" TEXT NOT NULL,
    "jockeyId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "numPartant" INTEGER NOT NULL,
    "placeCordepartant" TEXT NOT NULL,
    "statutPart" TEXT NOT NULL,
    "statutPartPcc" TEXT NOT NULL,
    "numPlaceArrivee" TEXT,
    "tempsPart" TEXT,
    "textePlaceArrivee" TEXT,
    "pdsCalcHandPartant" REAL NOT NULL,
    "pdsCondMontePartant" REAL NOT NULL,
    "oeilPartant" TEXT NOT NULL,
    "oeilPartantFirstTime" BOOLEAN NOT NULL DEFAULT false,
    "bonnet" BOOLEAN NOT NULL DEFAULT false,
    "attacheLangue" BOOLEAN NOT NULL DEFAULT false,
    "deferrerPartant" TEXT NOT NULL,
    "deferrerPartantFirstTime" BOOLEAN NOT NULL DEFAULT false,
    "typeEng" TEXT NOT NULL,
    "valeur" REAL,
    "coteReference" REAL,
    "silksPath" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Partant_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Partant_horseId_fkey" FOREIGN KEY ("horseId") REFERENCES "Horse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Partant_jockeyId_fkey" FOREIGN KEY ("jockeyId") REFERENCES "Jockey" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Partant_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PariCourse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "raceId" TEXT NOT NULL,
    "codePari" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "typeParis" TEXT NOT NULL,
    "color" TEXT,
    "audience" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PariCourse_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Rapport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "raceId" TEXT NOT NULL,
    "codePari" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "typeParis" TEXT NOT NULL,
    "betPath" TEXT,
    "oddsType" TEXT,
    "weight" INTEGER,
    "miseBase" TEXT,
    "codePariGenerique" TEXT,
    "audiencePariCourse" TEXT,
    "numerosGagnantsOption" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Rapport_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RapportCombinaison" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rapportId" TEXT NOT NULL,
    "combinaisonRapDef" TEXT NOT NULL,
    "typeReserveRapDef" TEXT NOT NULL,
    "gagnant" TEXT,
    "gagnantMb" TEXT,
    "place" TEXT,
    "placeMb" TEXT,
    "sumMisesGagn" TEXT,
    "sumMisesPlace" TEXT,
    "sumMisesGagnTypeRes" TEXT,
    "sumMisesPlaceTypeRes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RapportCombinaison_rapportId_fkey" FOREIGN KEY ("rapportId") REFERENCES "Rapport" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pronostic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "raceId" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "validated" BOOLEAN NOT NULL DEFAULT false,
    "chapeau" TEXT NOT NULL DEFAULT '',
    "presentation" TEXT,
    "publishedAt" TEXT NOT NULL,
    "validatedAt" TEXT,
    "creatorFirstname" TEXT NOT NULL,
    "creatorLastname" TEXT NOT NULL,
    "creatorPhotoUrl" TEXT NOT NULL,
    "creatorIsJournalist" BOOLEAN NOT NULL DEFAULT true,
    "creatorClassKey" INTEGER NOT NULL,
    "creatorUuid" TEXT NOT NULL,
    "creatorSlug" TEXT NOT NULL,
    "bases" TEXT NOT NULL,
    "bellesChances" TEXT NOT NULL,
    "outsiders" TEXT NOT NULL,
    "delaisses" TEXT NOT NULL,
    "betLinks" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pronostic_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PronosticAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pronosticId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "noteNumerique" REAL NOT NULL,
    "coteJournaliste" REAL NOT NULL,
    "numPartant" INTEGER NOT NULL,
    "analysisHorse" TEXT,
    "chevalNom" TEXT NOT NULL,
    "chevalSlug" TEXT NOT NULL,
    "chevalUuid" TEXT NOT NULL,
    "partantUuid" TEXT NOT NULL,
    "partantNumPartant" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PronosticAnalysis_pronosticId_fkey" FOREIGN KEY ("pronosticId") REFERENCES "Pronostic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InterviewSet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "raceId" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "authorFirstname" TEXT NOT NULL,
    "authorLastname" TEXT NOT NULL,
    "authorPhotoUrl" TEXT NOT NULL,
    "authorIsJournalist" BOOLEAN NOT NULL DEFAULT true,
    "authorClassKey" INTEGER NOT NULL,
    "authorUuid" TEXT NOT NULL,
    "authorSlug" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "updatedAtApi" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InterviewSet_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "interviewSetId" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "partantUuid" TEXT NOT NULL,
    "numPartant" INTEGER NOT NULL,
    "chevalNom" TEXT NOT NULL,
    "chevalUuid" TEXT NOT NULL,
    "personne" TEXT NOT NULL,
    "note" REAL,
    "texte" TEXT NOT NULL DEFAULT '',
    "subtitle" TEXT,
    "shortTitle" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Interview_interviewSetId_fkey" FOREIGN KEY ("interviewSetId") REFERENCES "InterviewSet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "raceId" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "accroche" TEXT NOT NULL DEFAULT '',
    "analyse" TEXT NOT NULL DEFAULT '',
    "authorFirstname" TEXT NOT NULL,
    "authorLastname" TEXT NOT NULL,
    "authorPhotoUrl" TEXT NOT NULL,
    "authorIsJournalist" BOOLEAN NOT NULL DEFAULT true,
    "authorClassKey" INTEGER NOT NULL,
    "authorUuid" TEXT NOT NULL,
    "authorSlug" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "updatedAtApi" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Notule_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NotulePartant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "notuleId" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "partantUuid" TEXT NOT NULL,
    "partantId" INTEGER NOT NULL,
    "numPartant" INTEGER NOT NULL,
    "chevalNom" TEXT NOT NULL,
    "chevalUuid" TEXT NOT NULL,
    "monteNom" TEXT NOT NULL,
    "numPlaceArrivee" TEXT NOT NULL,
    "textePlaceArrivee" TEXT NOT NULL,
    "statutPart" TEXT NOT NULL,
    "statutPartPcc" TEXT NOT NULL,
    "texte" TEXT NOT NULL DEFAULT '',
    "impressionActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NotulePartant_notuleId_fkey" FOREIGN KEY ("notuleId") REFERENCES "Notule" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PostRaceNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partantId" TEXT NOT NULL,
    "noteIdNavPartant" TEXT NOT NULL,
    "noteEquidia" REAL NOT NULL,
    "aptitudes" REAL NOT NULL,
    "formeCheval" REAL NOT NULL,
    "conditions" REAL NOT NULL,
    "tandem" REAL NOT NULL,
    "aptTerrain" REAL NOT NULL,
    "bruitsEcuries" REAL,
    "pronos" REAL,
    "noteCreatedAt" TEXT NOT NULL,
    "noteUpdatedAt" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PostRaceNote_partantId_fkey" FOREIGN KEY ("partantId") REFERENCES "Partant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tracking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "raceId" TEXT NOT NULL,
    "trackingIdNavPartant" TEXT NOT NULL,
    "numPartant" INTEGER NOT NULL,
    "chevalNom" TEXT NOT NULL,
    "chevalUuid" TEXT NOT NULL,
    "numPlaceArrivee" TEXT NOT NULL,
    "textePlaceArrivee" TEXT NOT NULL,
    "vmax" REAL NOT NULL,
    "tempsOfficiel" TEXT NOT NULL,
    "derniers600m" TEXT NOT NULL,
    "derniers200m" TEXT NOT NULL,
    "derniers100m" TEXT NOT NULL,
    "posMoy" INTEGER NOT NULL,
    "posMiCourse" INTEGER NOT NULL,
    "distanceParcouru" REAL NOT NULL,
    "parcouruVs1er" REAL NOT NULL,
    "active" INTEGER NOT NULL,
    "trackingCreatedAt" TEXT NOT NULL,
    "trackingUpdatedAt" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tracking_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HorseHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "horseId" TEXT NOT NULL,
    "raceGuid" TEXT NOT NULL,
    "raceUuid" TEXT NOT NULL,
    "dateReunion" TEXT NOT NULL,
    "libReunion" TEXT NOT NULL,
    "hippodromeName" TEXT NOT NULL,
    "numReunion" INTEGER NOT NULL,
    "numCoursePmu" INTEGER NOT NULL,
    "libcourtPrixCourse" TEXT NOT NULL,
    "liblongPrixCourse" TEXT,
    "discipline" TEXT NOT NULL,
    "categCourse" TEXT,
    "typeCourse" TEXT,
    "distance" INTEGER NOT NULL,
    "etatTerrain" TEXT NOT NULL,
    "montantTotalAllocation" TEXT,
    "numPlaceArrivee" TEXT NOT NULL,
    "textePlaceArrivee" TEXT NOT NULL,
    "pdsCalcHandPartant" REAL NOT NULL,
    "oeilPartant" TEXT NOT NULL,
    "tempsPart" TEXT,
    "nomMonte" TEXT NOT NULL,
    "valeur" REAL,
    "musique" TEXT NOT NULL,
    "vmax" REAL,
    "tempsOfficiel" TEXT,
    "derniers600m" TEXT,
    "derniers200m" TEXT,
    "derniers100m" TEXT,
    "distanceParcouru" REAL,
    "posMiCourse" INTEGER,
    "parcouruVs1er" REAL,
    "notulePartantText" TEXT,
    "notuleAuthorFirstname" TEXT,
    "notuleAuthorLastname" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HorseHistory_horseId_fkey" FOREIGN KEY ("horseId") REFERENCES "Horse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "raceId" TEXT NOT NULL,
    "referenceType" TEXT NOT NULL,
    "referenceGuid" TEXT,
    "dateReunion" TEXT NOT NULL,
    "libReunion" TEXT NOT NULL,
    "hippodromeName" TEXT NOT NULL,
    "numReunion" INTEGER NOT NULL,
    "numCoursePmu" INTEGER NOT NULL,
    "libcourtPrixCourse" TEXT NOT NULL,
    "discipline" TEXT NOT NULL,
    "distance" INTEGER NOT NULL,
    "heureDepartCourse" TEXT NOT NULL,
    "referenceMessage" TEXT,
    "photoPath" TEXT,
    "photoFinish" TEXT,
    "videoId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reference_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PhotoGallery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "raceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "runner" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PhotoGallery_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "raceId" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "commentsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isNextQrcode" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'published',
    "imageALaUneSlug" TEXT NOT NULL,
    "imageALaUneUpdatedAt" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "imagePreviewPath" TEXT,
    "urlImageArticle" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "chapo" TEXT NOT NULL DEFAULT '',
    "publishedAt" TEXT NOT NULL,
    "authorFirstname" TEXT NOT NULL,
    "authorLastname" TEXT NOT NULL,
    "authorIsJournalist" BOOLEAN NOT NULL DEFAULT true,
    "categoryUuid" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "categorySlug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Article_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ArticleTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT NOT NULL,
    "tagUuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ArticleTag_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PariSimple" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "raceId" TEXT NOT NULL,
    "chevalNom" TEXT NOT NULL,
    "chevalUuid" TEXT NOT NULL,
    "numPartant" INTEGER NOT NULL,
    "intentionDeferrer" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "rappRef" REAL NOT NULL,
    "rappEvol" REAL NOT NULL,
    "favori" BOOLEAN NOT NULL DEFAULT false,
    "tendanceSigne" TEXT NOT NULL,
    "heureRapEvol" TEXT NOT NULL,
    "history" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PariSimple_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApiCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "endpoint" TEXT NOT NULL,
    "params" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SyncStatus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "lastSyncAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "HorseTrainer" (
    "horseId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("horseId", "trainerId", "startDate"),
    CONSTRAINT "HorseTrainer_horseId_fkey" FOREIGN KEY ("horseId") REFERENCES "Horse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HorseTrainer_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "currentRaceGuid" TEXT,
    "currentHorseSlug" TEXT,
    "lastActivityAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "raceGuid" TEXT,
    "horseSlug" TEXT,
    "tokens" INTEGER,
    "model" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession" ("sessionId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_HorseTrainer" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_HorseTrainer_A_fkey" FOREIGN KEY ("A") REFERENCES "Horse" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_HorseTrainer_B_fkey" FOREIGN KEY ("B") REFERENCES "Trainer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Hippodrome_code_key" ON "Hippodrome"("code");

-- CreateIndex
CREATE INDEX "Hippodrome_code_idx" ON "Hippodrome"("code");

-- CreateIndex
CREATE INDEX "Hippodrome_countryCode_idx" ON "Hippodrome"("countryCode");

-- CreateIndex
CREATE INDEX "Reunion_dateReunion_idx" ON "Reunion"("dateReunion");

-- CreateIndex
CREATE INDEX "Reunion_specialiteReunion_idx" ON "Reunion"("specialiteReunion");

-- CreateIndex
CREATE UNIQUE INDEX "Reunion_dateReunion_numReunion_libReunion_key" ON "Reunion"("dateReunion", "numReunion", "libReunion");

-- CreateIndex
CREATE UNIQUE INDEX "Race_uuid_key" ON "Race"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Race_guid_key" ON "Race"("guid");

-- CreateIndex
CREATE INDEX "Race_guid_idx" ON "Race"("guid");

-- CreateIndex
CREATE INDEX "Race_reunionId_idx" ON "Race"("reunionId");

-- CreateIndex
CREATE INDEX "Race_discipline_idx" ON "Race"("discipline");

-- CreateIndex
CREATE INDEX "Race_statutCourseId_idx" ON "Race"("statutCourseId");

-- CreateIndex
CREATE INDEX "Race_isQuintePlus_idx" ON "Race"("isQuintePlus");

-- CreateIndex
CREATE UNIQUE INDEX "Horse_uuid_key" ON "Horse"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Horse_slug_key" ON "Horse"("slug");

-- CreateIndex
CREATE INDEX "Horse_slug_idx" ON "Horse"("slug");

-- CreateIndex
CREATE INDEX "Horse_nomCheval_idx" ON "Horse"("nomCheval");

-- CreateIndex
CREATE UNIQUE INDEX "HorseStats_horseId_key" ON "HorseStats"("horseId");

-- CreateIndex
CREATE INDEX "HorseStats_horseId_idx" ON "HorseStats"("horseId");

-- CreateIndex
CREATE INDEX "HorseStats_quintePercent_idx" ON "HorseStats"("quintePercent");

-- CreateIndex
CREATE INDEX "HorseStats_carriereNbVictoire_idx" ON "HorseStats"("carriereNbVictoire");

-- CreateIndex
CREATE UNIQUE INDEX "Trainer_uuid_key" ON "Trainer"("uuid");

-- CreateIndex
CREATE INDEX "Trainer_uuid_idx" ON "Trainer"("uuid");

-- CreateIndex
CREATE INDEX "Trainer_nomEntraineur_idx" ON "Trainer"("nomEntraineur");

-- CreateIndex
CREATE UNIQUE INDEX "Jockey_uuid_key" ON "Jockey"("uuid");

-- CreateIndex
CREATE INDEX "Jockey_uuid_idx" ON "Jockey"("uuid");

-- CreateIndex
CREATE INDEX "Jockey_nomMonte_idx" ON "Jockey"("nomMonte");

-- CreateIndex
CREATE INDEX "Partant_horseId_idx" ON "Partant"("horseId");

-- CreateIndex
CREATE INDEX "Partant_jockeyId_idx" ON "Partant"("jockeyId");

-- CreateIndex
CREATE INDEX "Partant_trainerId_idx" ON "Partant"("trainerId");

-- CreateIndex
CREATE UNIQUE INDEX "Partant_raceId_numPartant_key" ON "Partant"("raceId", "numPartant");

-- CreateIndex
CREATE INDEX "PariCourse_raceId_idx" ON "PariCourse"("raceId");

-- CreateIndex
CREATE INDEX "PariCourse_codePari_idx" ON "PariCourse"("codePari");

-- CreateIndex
CREATE INDEX "Rapport_raceId_idx" ON "Rapport"("raceId");

-- CreateIndex
CREATE INDEX "Rapport_codePari_idx" ON "Rapport"("codePari");

-- CreateIndex
CREATE INDEX "RapportCombinaison_rapportId_idx" ON "RapportCombinaison"("rapportId");

-- CreateIndex
CREATE INDEX "RapportCombinaison_combinaisonRapDef_idx" ON "RapportCombinaison"("combinaisonRapDef");

-- CreateIndex
CREATE UNIQUE INDEX "Pronostic_raceId_key" ON "Pronostic"("raceId");

-- CreateIndex
CREATE UNIQUE INDEX "Pronostic_uuid_key" ON "Pronostic"("uuid");

-- CreateIndex
CREATE INDEX "Pronostic_uuid_idx" ON "Pronostic"("uuid");

-- CreateIndex
CREATE INDEX "Pronostic_creatorUuid_idx" ON "Pronostic"("creatorUuid");

-- CreateIndex
CREATE INDEX "PronosticAnalysis_pronosticId_idx" ON "PronosticAnalysis"("pronosticId");

-- CreateIndex
CREATE INDEX "PronosticAnalysis_numPartant_idx" ON "PronosticAnalysis"("numPartant");

-- CreateIndex
CREATE INDEX "PronosticAnalysis_chevalUuid_idx" ON "PronosticAnalysis"("chevalUuid");

-- CreateIndex
CREATE INDEX "PronosticAnalysis_partantUuid_idx" ON "PronosticAnalysis"("partantUuid");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewSet_raceId_key" ON "InterviewSet"("raceId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewSet_uuid_key" ON "InterviewSet"("uuid");

-- CreateIndex
CREATE INDEX "InterviewSet_uuid_idx" ON "InterviewSet"("uuid");

-- CreateIndex
CREATE INDEX "InterviewSet_authorUuid_idx" ON "InterviewSet"("authorUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Interview_uuid_key" ON "Interview"("uuid");

-- CreateIndex
CREATE INDEX "Interview_interviewSetId_idx" ON "Interview"("interviewSetId");

-- CreateIndex
CREATE INDEX "Interview_numPartant_idx" ON "Interview"("numPartant");

-- CreateIndex
CREATE INDEX "Interview_uuid_idx" ON "Interview"("uuid");

-- CreateIndex
CREATE INDEX "Interview_partantUuid_idx" ON "Interview"("partantUuid");

-- CreateIndex
CREATE INDEX "Interview_chevalUuid_idx" ON "Interview"("chevalUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Notule_raceId_key" ON "Notule"("raceId");

-- CreateIndex
CREATE UNIQUE INDEX "Notule_uuid_key" ON "Notule"("uuid");

-- CreateIndex
CREATE INDEX "Notule_uuid_idx" ON "Notule"("uuid");

-- CreateIndex
CREATE INDEX "Notule_authorUuid_idx" ON "Notule"("authorUuid");

-- CreateIndex
CREATE UNIQUE INDEX "NotulePartant_uuid_key" ON "NotulePartant"("uuid");

-- CreateIndex
CREATE INDEX "NotulePartant_notuleId_idx" ON "NotulePartant"("notuleId");

-- CreateIndex
CREATE INDEX "NotulePartant_numPartant_idx" ON "NotulePartant"("numPartant");

-- CreateIndex
CREATE INDEX "NotulePartant_uuid_idx" ON "NotulePartant"("uuid");

-- CreateIndex
CREATE INDEX "NotulePartant_partantUuid_idx" ON "NotulePartant"("partantUuid");

-- CreateIndex
CREATE INDEX "NotulePartant_chevalUuid_idx" ON "NotulePartant"("chevalUuid");

-- CreateIndex
CREATE INDEX "NotulePartant_impressionActive_idx" ON "NotulePartant"("impressionActive");

-- CreateIndex
CREATE UNIQUE INDEX "PostRaceNote_partantId_key" ON "PostRaceNote"("partantId");

-- CreateIndex
CREATE UNIQUE INDEX "PostRaceNote_noteIdNavPartant_key" ON "PostRaceNote"("noteIdNavPartant");

-- CreateIndex
CREATE INDEX "PostRaceNote_partantId_idx" ON "PostRaceNote"("partantId");

-- CreateIndex
CREATE INDEX "PostRaceNote_noteIdNavPartant_idx" ON "PostRaceNote"("noteIdNavPartant");

-- CreateIndex
CREATE INDEX "PostRaceNote_noteEquidia_idx" ON "PostRaceNote"("noteEquidia");

-- CreateIndex
CREATE UNIQUE INDEX "Tracking_trackingIdNavPartant_key" ON "Tracking"("trackingIdNavPartant");

-- CreateIndex
CREATE INDEX "Tracking_raceId_idx" ON "Tracking"("raceId");

-- CreateIndex
CREATE INDEX "Tracking_chevalUuid_idx" ON "Tracking"("chevalUuid");

-- CreateIndex
CREATE INDEX "Tracking_trackingIdNavPartant_idx" ON "Tracking"("trackingIdNavPartant");

-- CreateIndex
CREATE INDEX "Tracking_vmax_idx" ON "Tracking"("vmax");

-- CreateIndex
CREATE INDEX "Tracking_posMoy_idx" ON "Tracking"("posMoy");

-- CreateIndex
CREATE UNIQUE INDEX "Tracking_raceId_numPartant_key" ON "Tracking"("raceId", "numPartant");

-- CreateIndex
CREATE INDEX "HorseHistory_horseId_idx" ON "HorseHistory"("horseId");

-- CreateIndex
CREATE INDEX "HorseHistory_dateReunion_idx" ON "HorseHistory"("dateReunion");

-- CreateIndex
CREATE INDEX "HorseHistory_raceGuid_idx" ON "HorseHistory"("raceGuid");

-- CreateIndex
CREATE UNIQUE INDEX "HorseHistory_horseId_raceGuid_key" ON "HorseHistory"("horseId", "raceGuid");

-- CreateIndex
CREATE INDEX "Reference_raceId_idx" ON "Reference"("raceId");

-- CreateIndex
CREATE INDEX "Reference_referenceType_idx" ON "Reference"("referenceType");

-- CreateIndex
CREATE INDEX "Reference_referenceGuid_idx" ON "Reference"("referenceGuid");

-- CreateIndex
CREATE INDEX "Reference_videoId_idx" ON "Reference"("videoId");

-- CreateIndex
CREATE INDEX "PhotoGallery_raceId_idx" ON "PhotoGallery"("raceId");

-- CreateIndex
CREATE UNIQUE INDEX "Article_uuid_key" ON "Article"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_raceId_idx" ON "Article"("raceId");

-- CreateIndex
CREATE INDEX "Article_slug_idx" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_uuid_idx" ON "Article"("uuid");

-- CreateIndex
CREATE INDEX "Article_type_idx" ON "Article"("type");

-- CreateIndex
CREATE INDEX "Article_publishedAt_idx" ON "Article"("publishedAt");

-- CreateIndex
CREATE INDEX "Article_categorySlug_idx" ON "Article"("categorySlug");

-- CreateIndex
CREATE INDEX "ArticleTag_articleId_idx" ON "ArticleTag"("articleId");

-- CreateIndex
CREATE INDEX "ArticleTag_slug_idx" ON "ArticleTag"("slug");

-- CreateIndex
CREATE INDEX "ArticleTag_tagUuid_idx" ON "ArticleTag"("tagUuid");

-- CreateIndex
CREATE INDEX "PariSimple_raceId_idx" ON "PariSimple"("raceId");

-- CreateIndex
CREATE INDEX "PariSimple_chevalUuid_idx" ON "PariSimple"("chevalUuid");

-- CreateIndex
CREATE INDEX "PariSimple_favori_idx" ON "PariSimple"("favori");

-- CreateIndex
CREATE INDEX "PariSimple_rappEvol_idx" ON "PariSimple"("rappEvol");

-- CreateIndex
CREATE UNIQUE INDEX "PariSimple_raceId_numPartant_key" ON "PariSimple"("raceId", "numPartant");

-- CreateIndex
CREATE INDEX "ApiCache_endpoint_idx" ON "ApiCache"("endpoint");

-- CreateIndex
CREATE INDEX "ApiCache_expiresAt_idx" ON "ApiCache"("expiresAt");

-- CreateIndex
CREATE INDEX "SyncStatus_entityType_idx" ON "SyncStatus"("entityType");

-- CreateIndex
CREATE INDEX "SyncStatus_lastSyncAt_idx" ON "SyncStatus"("lastSyncAt");

-- CreateIndex
CREATE UNIQUE INDEX "SyncStatus_entityType_entityId_key" ON "SyncStatus"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "HorseTrainer_horseId_idx" ON "HorseTrainer"("horseId");

-- CreateIndex
CREATE INDEX "HorseTrainer_trainerId_idx" ON "HorseTrainer"("trainerId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatSession_sessionId_key" ON "ChatSession"("sessionId");

-- CreateIndex
CREATE INDEX "ChatSession_sessionId_idx" ON "ChatSession"("sessionId");

-- CreateIndex
CREATE INDEX "ChatSession_userId_idx" ON "ChatSession"("userId");

-- CreateIndex
CREATE INDEX "ChatSession_currentRaceGuid_idx" ON "ChatSession"("currentRaceGuid");

-- CreateIndex
CREATE INDEX "ChatSession_expiresAt_idx" ON "ChatSession"("expiresAt");

-- CreateIndex
CREATE INDEX "ChatMessage_sessionId_idx" ON "ChatMessage"("sessionId");

-- CreateIndex
CREATE INDEX "ChatMessage_role_idx" ON "ChatMessage"("role");

-- CreateIndex
CREATE INDEX "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "_HorseTrainer_AB_unique" ON "_HorseTrainer"("A", "B");

-- CreateIndex
CREATE INDEX "_HorseTrainer_B_index" ON "_HorseTrainer"("B");
