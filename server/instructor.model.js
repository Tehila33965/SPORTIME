import { Schema, model } from 'mongoose';

const instructorSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Instructor name is required'],
            trim: true,
        },
        specialization: { // סוג ההתמחות של המדריך  
            type: String,
            required: [true, 'Specialization is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
        },
        image: {
            type: String,
            default: '',
        }
    },
    { timestamps: true }
);

const Instructor = model('Instructor', instructorSchema);
export default Instructor;