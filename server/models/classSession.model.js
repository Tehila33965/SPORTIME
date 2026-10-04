import { Schema, model } from 'mongoose';

const classSessionSchema = new Schema(
    {
        // קישור לתבנית השיעור
        classTemplate: {
            type: Schema.Types.ObjectId,
            ref: 'ClassTemplate',
            required: true,
        },
        // קישור למורה שמעביר את השיעור הספציפי הזה
        instructor: {
            type: Schema.Types.ObjectId,
            ref: 'Instructor',
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        time: {
            type: String,
            required: true,
            match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use a valid time format (HH:MM)']
        },
        maxParticipants: {
            type: Number,
            required: true, 
            min: [5, 'A class must have a minimum of 5 participants to take place'],
        },
    },
    { timestamps: true }
);


classSessionSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
        return ret;
    }
});

export const ClassSession = model('ClassSession', classSessionSchema);