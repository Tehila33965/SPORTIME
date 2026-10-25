/**
 * הרצה: node --env-file=.env server/scripts/recount.js
 */

import { disconnect } from 'mongoose';
import { connectDB } from '../config/db.js';
import { ClassSession } from '../models/classSession.model.js';
import { Registration } from '../models/registration.model.js';

const recountRegisteredSessions = async () => {
    const [sessions, registrationCounts] = await Promise.all([
        ClassSession.find({}, { _id: 1, registeredCount: 1 }).lean(),
        Registration.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $group: { _id: '$session', count: { $sum: 1 } } },
        ]),
    ]);

    const countsBySession = new Map(
        registrationCounts.map(({ _id, count }) => [String(_id), count])
    );
    const operations = [];
    let correctedCount = 0;

    for (const session of sessions) {
        const registeredCount = countsBySession.get(String(session._id)) ?? 0;
        if (session.registeredCount === registeredCount) {
            continue;
        }

        operations.push({
            updateOne: {
                filter: { _id: session._id },
                update: { $set: { registeredCount } },
            },
        });
        correctedCount += 1;
    }

    if (operations.length) {
        await ClassSession.bulkWrite(operations);
    }

    console.log(`תוקנו ${correctedCount} שיעורים.`);
};

const main = async () => {
    try {
        await connectDB();
        await recountRegisteredSessions();
    } catch (error) {
        console.error('חישוב מחדש של מספר הנרשמים נכשל:', error.message || error);
        process.exitCode = 1;
    } finally {
        await disconnect();
        console.log('החיבור למסד הנתונים נסגר.');
    }
};

main();
