import { User } from '../models/user.model.js';
import jwt from 'jsonwebtoken';

export const getAllUsers = async (req, res, next) => {
    try {
        const page = +req.query.page || 1;
        const limit = +req.query.limit || 10;
        const filter = {};

        if (req.query.name) {
            filter.name = { $regex: req.query.name, $options: 'i' };
        }

        if (req.query.email) {
            filter.email = { $regex: req.query.email, $options: 'i' };
        }

        const users = await User.find(filter)
            .skip((page - 1) * limit)
            .limit(limit);

        res.json(users);
    } 
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return next({ status: 404, error: new Error('User not found'), type: 'resource not found error' });
        }

        res.json(user);
    } 
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};

export const addUser = async (req, res, next) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();

        res.status(201).json(newUser);
    } 
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return next({ status: 404, error: new Error('User not found'), type: 'resource not found error' });
        }

        // מניעת עדכון שדות רגישים דרך המסלול הזה
        delete req.body.password;
        delete req.body.role;

        Object.assign(user, req.body);
        await user.save();

        res.json(user);
    } 
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};

export const changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.params.id; // או מתוך ה-Token של המשתמש המחובר בהמשך

        const user = await User.findById(userId);
        if (!user) {
            return next({ status: 404, error: new Error('User not found'), type: 'resource not found error' });
        }

        const isMatch = await User.checkPassword(oldPassword, user.password);
        if (!isMatch) {
            return next({ status: 400, error: new Error('Incorrect old password'), type: 'bad request' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    }
    catch (error)  {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return next({ status: 404, error: new Error('User not found'), type: 'resource not found error' });
        }

        res.status(204).send();
    } 
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};

export const signUp = async (req, res, next) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();

        res.status(201).json(newUser);
    }
    catch (error) {
        // טיפול במקרה שהאימייל כבר קיים במסד הנתונים (Duplicate Key Error)
        if (error.code === 11000) {
            return next({ status: 400, error: new Error('Email already exists'), type: 'bad request' });
        }
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};

export const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return next({ status: 401, error: new Error("Invalid email or password"), type: 'authentication error' });
        }

        const isCorrect = await User.checkPassword(password, user.password);

        if (!isCorrect) {
            return next({ status: 401, error: new Error("Invalid email or password"), type: "authentication error" });
        }

        // יצירת JSON Web Token (JWT) עבור המשתמש המחובר
        const token = jwt.sign(
            { userId: user._id, role: user.role }, 
            process.env.JWT_SECRET, // המפתח הסודי שמוגדר בקובץ ה-.env
            { expiresIn: '7d' }     // תוקף הטוקן
        );

        // מחזירים ללקוח הודעת הצלחה, את הטוקן, ואת פרטי המשתמש (ה-toJSON במודל יסתיר את הסיסמה)
        res.json({
            message: "Signed in successfully",
            token,
            user
        });
    }
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};