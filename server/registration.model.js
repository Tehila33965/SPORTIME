import { Schema, model } from 'mongoose';

const registrationSchema = new Schema(
    {
        // המשתמש שנרשם לשיעור
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required'],
        },
        // מועד השיעור הספציפי אליו נרשם
        session: {
            type: Schema.Types.ObjectId,
            ref: 'ClassSession',
            required: [true, 'Session reference is required'],
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

const Registration = model('Registration', registrationSchema);
export default Registration;