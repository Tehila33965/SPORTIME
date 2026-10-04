import { Schema, model } from 'mongoose';

const classSessionSchema = new Schema(
    {
        // קישור לתבנית השיעור
        classTemplate: {
            type: Schema.Types.ObjectId,
            ref: 'ClassTemplate',
            required: [true, 'Class template reference is required'],
        },
        // קישור למורה שמעביר את השיעור הספציפי הזה
        instructor: {
            type: Schema.Types.ObjectId,
            ref: 'Instructor',
            required: [true, 'Instructor reference is required'],
        },
        date: {
            type: Date,
            required: [true, 'Date is required'],
        },
        time: {
            type: String,
            required: [true, 'Time is required'],
            match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use a valid time format (HH:MM)']
        },
        maxParticipants: {
            type: Number,
            required: [true, 'Max participants is required'],
            min: [5, 'A class must have a minimum of 5 participants to take place'],
        },
    },
    { timestamps: true }
);

const ClassSession = model('ClassSession', classSessionSchema);
export default ClassSession;