import { Schema, model } from 'mongoose';

const instructorSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        // התמחות
        specialization: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            type: String,
            default: '',
        }
    },
    { timestamps: true }
);

// סינון שדות מערכתיים בעת המרה ל-JSON
instructorSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
        return ret;
    }
});

export const Instructor = model('Instructor', instructorSchema);