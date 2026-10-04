import { Schema, model } from 'mongoose';

const classTemplateSchema = new Schema(
    {
        title: {
            type: String,
            required: true, 
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true, 
            trim: true,
        },
        image: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);


classTemplateSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
        return ret;
    }
});

export const ClassTemplate = model('ClassTemplate', classTemplateSchema);