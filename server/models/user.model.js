import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true 
    },
    password: { 
        type: String, 
        required: true, 
        minlength: 6 
    },
    role: { 
        type: String, 
        enum: ['client', 'admin'], 
        default: 'client' }
}, { timestamps: true });


// הצפנת סיסמה אוטומטית לפני שמירה במסד הנתונים
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
});


// מתודה סטטית לבדיקת סיסמה בעת התחברות
userSchema.statics.checkPassword = async function (password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
};


// סינון שדות רגישים (מחיקת סיסמה וגרסה) לפני החזרת הנתונים ללקוח
userSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;

        ret.id = ret._id;
        delete ret._id;
        
        return ret;
    }
});

export const User = model('User', userSchema);