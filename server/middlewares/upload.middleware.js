import multer from 'multer';
import path from 'path';
import fs from 'fs';

// נתיב מלא לתיקייה, והיא נוצרת אם היא לא קיימת (זו הסיבה לשגיאת 500)
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// הגדרת מנגנון האחסון (Storage) של Multer - קובע איפה ואיך לשמור את הקבצים בדיסק השרת
const storage = multer.diskStorage({
    // קביעת תיקיית היעד לשמירת הקובץ שהועלה
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('סוג הקובץ חייב להיות JPG, PNG, GIF או WEBP'), false);
    }
};

// אתחול מוגדר של Multer
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// קבלת הקובץ. שגיאות העלאה חוזרות כ-400 ולא כ-500
const receiveFile = (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            return next({ status: 400, error: err, type: 'Upload Error' });
        }
        next();
    });
};

// שמירת הנתיב של התמונה ב-req.body.image כדי שיישמר ב-DB
const attachImagePath = (req, res, next) => {
    if (req.file) {
        req.body.image = `/uploads/${req.file.filename}`;
    }
    next();
};

export const uploadImage = [receiveFile, attachImagePath];