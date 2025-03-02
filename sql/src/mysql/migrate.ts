import type { MySQL } from "~/index";
import util from '@ninjalib/util';

export type MigrationFn = (step: number, query: string | ((db: MySQL) => Promise<void>)) => void;
export type Migration = (runStep: MigrationFn) => void;

const log = util.logger('sql:mysql:migrator');

export async function migrator(migration: Migration, db: MySQL) {
    const steps: { step: number, query: string | ((db: MySQL) => Promise<void>) }[] = [];

    function runStep(step: number, query: string | ((db: MySQL) => Promise<void>)) {
        const expectedStep = (steps[steps.length - 1]?.step ?? 0) + 1;
        if (step !== expectedStep) {
            throw new Error(`Invalid step, expected "${expectedStep}" but got "${step}"`);
        }
        steps.push({ step, query });
    }
    async function getCurrentStep() {
        const dbStep = (await db.getRow<{ step: number }>('__migration__'))?.step;
        if (dbStep === undefined) {
            await db.insertOne('__migration__', { step: 0 });
            return 0;
        }
        if (Number.isNaN(+dbStep)) {
            // Shouldn't happen unless someone messes with the table manually
            throw new Error(`The current migration step is invalid`);
        } else {
            return +dbStep;
        }
    }

    // Run migration file and collect migrations needed to be ran
    migration(runStep);

    // Ensure table exists
    await db.query('CREATE TABLE IF NOT EXISTS __migration__ (step INT NOT NULL)')

    // Get current step
    const currentStep = await getCurrentStep();

    // Run migrations (in transaction)
    await db.transaction(async (tx) => {
        for (const migration of steps) {
            if (migration.step <= currentStep) {
                // Already ran
                continue;
            }
            log.info(`Migrating step ${migration.step}...`)
            try {
                if (typeof migration.query === 'function') {
                    await migration.query(tx);
                } else {
                    await tx.query(migration.query);
                }
                await tx.query('UPDATE __migration__ SET step = step + 1');
                log.info(`Finished migrating step ${migration.step}`);
            } catch (err) {
                throw new Error(`Failed to migrate step "${migration.step}": ${err}`);
            }
        }
    })
}
