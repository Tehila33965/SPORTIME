/**
 * הרצה: node --env-file=.env server/scripts/seed.js
 */

import { disconnect } from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/user.model.js';
import { Instructor } from '../models/instructor.model.js';
import { ClassTemplate } from '../models/classTemplate.model.js';
import { ClassSession } from '../models/classSession.model.js';

const SEED_PASSWORD = process.env.SEED_PASSWORD;

const getDayKey = (offset) => {
    const base = new Date();
    const date = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()));
    date.setUTCDate(date.getUTCDate() + offset);
    return date;
};

const getUpcomingWeekdayOffsets = (count = 10) => {
    const offsets = [];
    let offset = 0;

    while (offsets.length < count) {
        const candidate = getDayKey(offset);
        if (candidate.getUTCDay() !== 6) {
            offsets.push(offset);
        }
        offset += 1;
    }

    return offsets;
};

const createSeedData = async () => {
    const hadAdmin = await User.exists({ role: 'admin' });
    let createdUsers = 0;

    if (!hadAdmin) {
        const admin = new User({
            name: 'מנהל מערכת',
            email: 'admin@sportime.local',
            password: SEED_PASSWORD,
            role: 'admin'
        });

        const client = new User({
            name: 'לקוח דמו',
            email: 'client@sportime.local',
            password: SEED_PASSWORD,
            role: 'client'
        });

        await admin.save();
        await client.save();
        createdUsers = 2;
    }

    const instructorsCount = await Instructor.countDocuments();
    let createdInstructors = 0;

    if (instructorsCount === 0) {
        const instructors = [
            { name: 'רונית כהן', specialization: 'כוח', email: 'ronit@sportime.local', phone: '0501234567', image: '' },
            { name: 'דניאל לוי', specialization: 'יוגה', email: 'daniel@sportime.local', phone: '0507654321', image: '' },
            { name: 'עידו בר', specialization: 'פונקציונלי', email: 'ido@sportime.local', phone: '0509876543', image: '' }
        ];

        for (const instructorData of instructors) {
            await new Instructor(instructorData).save();
            createdInstructors += 1;
        }
    }

    const templatesCount = await ClassTemplate.countDocuments();
    let createdTemplates = 0;

    if (templatesCount === 0) {
        const templates = [
            { title: 'כוח', description: 'אימון כוח בסיסי עם מיקוד בחיזוק שרירים וביצוע תרגילים מבוקרים.', category: 'כוח', image: '' },
            { title: 'יוגה', description: 'סדרה של תרגילי גמישות, איזון ונשימה לקראת שבוע רגוע ומאוזן.', category: 'יוגה', image: '' },
            { title: 'פונקציונלי', description: 'אימון פונקציונלי שמחזק יציבה, סיבולת כוח ויכולת תנועה.', category: 'פונקציונלי', image: '' }
        ];

        for (const templateData of templates) {
            await new ClassTemplate(templateData).save();
            createdTemplates += 1;
        }
    }

    const sessionsCount = await ClassSession.countDocuments();
    let createdSessions = 0;

    if (sessionsCount === 0) {
        const instructors = await Instructor.find().lean();
        const templates = await ClassTemplate.find().lean();
        const upcomingOffsets = getUpcomingWeekdayOffsets(10);
        const timeSlots = ['08:00', '09:00', '10:30', '12:00', '17:00', '18:00', '18:30', '19:00', '20:00', '21:00'];
        const registeredValues = [0, 0, 3, 0, 0, 0, 7, 0, 15, 0];

        for (let index = 0; index < upcomingOffsets.length; index += 1) {
            const offset = upcomingOffsets[index];
            const date = getDayKey(offset);
            const template = templates[index % templates.length];
            const instructor = instructors[index % instructors.length];

            await new ClassSession({
                classTemplate: template._id,
                instructor: instructor._id,
                date: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())),
                time: timeSlots[index],
                maxParticipants: 15,
                registeredCount: registeredValues[index]
            }).save();

            createdSessions += 1;
        }
    }

    const finalUserCount = await User.countDocuments();
    const finalInstructorCount = await Instructor.countDocuments();
    const finalTemplateCount = await ClassTemplate.countDocuments();
    const finalSessionCount = await ClassSession.countDocuments();

    console.log('סיכום נתוני ה-seed:');
    console.log(`- משתמשים: ${finalUserCount} (${createdUsers > 0 ? `נוצרו ${createdUsers}` : 'כבר היו קיימים'})`);
    console.log(`- מאמנים: ${finalInstructorCount} (${createdInstructors > 0 ? `נוצרו ${createdInstructors}` : 'כבר היו קיימים'})`);
    console.log(`- תבניות שיעורים: ${finalTemplateCount} (${createdTemplates > 0 ? `נוצרו ${createdTemplates}` : 'כבר היו קיימים'})`);
    console.log(`- שיעורים: ${finalSessionCount} (${createdSessions > 0 ? `נוצרו ${createdSessions}` : 'כבר היו קיימים'})`);
};

const main = async () => {
    try {
        await connectDB();

        if (!SEED_PASSWORD) {
            console.log('הסיסמה SEED_PASSWORD חסרה. הסקריפט יוצא ללא יצירת נתונים חדשים.');
            return;
        }

        await createSeedData();
    } catch (error) {
        console.error('הזרמת ה-seed נכשלה:', error.message || error);
    } finally {
        await disconnect();
        console.log('החיבור למסד הנתונים נסגר.');
    }
};

main();
