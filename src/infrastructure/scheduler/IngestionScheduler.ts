// Infrastructure: Ingestion Scheduler
import { DateTime } from 'luxon';
import { IIngestionService } from '../../domain/interfaces/IIngestionService';

export class IngestionScheduler {
  private intervals: NodeJS.Timeout[] = [];
  private isRunning = false;

  constructor(private ingestionService: IIngestionService) {}

  /**
   * Start the scheduler
   */
  start() {
    if (this.isRunning) {
      console.log('[SCHEDULER] Already running');
      return;
    }

    this.isRunning = true;
    console.log('[SCHEDULER] Starting ingestion scheduler');

    // Schedule daily full ingestion at 2 AM
    this.scheduleDailyIngestion();

    // Schedule updates every 6 hours
    this.schedulePeriodicUpdates();

    console.log('[SCHEDULER] Scheduler started successfully');
  }

  /**
   * Stop the scheduler
   */
  stop() {
    console.log('[SCHEDULER] Stopping scheduler');
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals = [];
    this.isRunning = false;
    console.log('[SCHEDULER] Scheduler stopped');
  }

  /**
   * Run full ingestion immediately (manual trigger)
   */
  async runFullIngestion() {
    console.log('[SCHEDULER] Manual full ingestion triggered');
    try {
      const summary = await this.ingestionService.ingestUpcoming(2);
      console.log('[SCHEDULER] Manual ingestion completed:', summary);
      return summary;
    } catch (error: any) {
      console.error('[SCHEDULER] Manual ingestion failed:', error.message);
      throw error;
    }
  }

  /**
   * Run update immediately (manual trigger)
   */
  async runUpdate() {
    console.log('[SCHEDULER] Manual update triggered');
    try {
      const today = DateTime.now().toFormat('yyyy-MM-dd');
      const tomorrow = DateTime.now().plus({ days: 1 }).toFormat('yyyy-MM-dd');

      const [todayResult, tomorrowResult] = await Promise.all([
        this.ingestionService.updateExistingRaces(today),
        this.ingestionService.updateExistingRaces(tomorrow)
      ]);

      console.log('[SCHEDULER] Manual update completed');
      return { today: todayResult, tomorrow: tomorrowResult };
    } catch (error: any) {
      console.error('[SCHEDULER] Manual update failed:', error.message);
      throw error;
    }
  }

  /**
   * Schedule daily full ingestion at 2 AM
   */
  private scheduleDailyIngestion() {
    const runAt = 2; // 2 AM

    const checkAndRun = async () => {
      const now = DateTime.now();
      const hour = now.hour;

      // Run at 2 AM
      if (hour === runAt) {
        console.log('[SCHEDULER] Running scheduled daily ingestion');
        try {
          await this.ingestionService.ingestUpcoming(2);
          console.log('[SCHEDULER] Daily ingestion completed');
        } catch (error: any) {
          console.error('[SCHEDULER] Daily ingestion failed:', error.message);
        }
      }
    };

    // Check every hour
    const interval = setInterval(checkAndRun, 60 * 60 * 1000);
    this.intervals.push(interval);

    console.log(`[SCHEDULER] Daily ingestion scheduled for ${runAt}:00 AM`);
  }

  /**
   * Schedule periodic updates every 6 hours
   */
  private schedulePeriodicUpdates() {
    const runUpdate = async () => {
      console.log('[SCHEDULER] Running scheduled update');
      try {
        const today = DateTime.now().toFormat('yyyy-MM-dd');
        const tomorrow = DateTime.now().plus({ days: 1 }).toFormat('yyyy-MM-dd');

        await Promise.all([
          this.ingestionService.updateExistingRaces(today),
          this.ingestionService.updateExistingRaces(tomorrow)
        ]);

        console.log('[SCHEDULER] Scheduled update completed');
      } catch (error: any) {
        console.error('[SCHEDULER] Scheduled update failed:', error.message);
      }
    };

    // Run every 6 hours
    const interval = setInterval(runUpdate, 6 * 60 * 60 * 1000);
    this.intervals.push(interval);

    console.log('[SCHEDULER] Periodic updates scheduled every 6 hours');
  }
}
