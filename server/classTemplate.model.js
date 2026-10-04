import { Schema, model } from 'mongoose';

const classTemplateSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Class title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
        },
        image: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

const ClassTemplate = model('ClassTemplate', classTemplateSchema);
export default ClassTemplate;