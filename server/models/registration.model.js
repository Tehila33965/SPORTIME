import { Schema, model } from 'mongoose';

const registrationSchema = new Schema(
    {
        // המשתמש שנרשם לשיעור
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // מועד השיעור הספציפי אליו נרשם
        session: {
            type: Schema.Types.ObjectId,
            ref: 'ClassSession',
            required: true,
        },
        // סטטוס ההרשמה
        status: {
            type: String,
            enum: ['confirmed', 'cancelled'],
            default: 'confirmed',
        },
    },
    { timestamps: true }
);

// מניעת כפילות: משתמש לא יכול להירשם לאותו סשן פעמיים
registrationSchema.index({ user: 1, session: 1 }, { unique: true });

registrationSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
        return ret;
    }
});

export const Registration = model('Registration', registrationSchema);