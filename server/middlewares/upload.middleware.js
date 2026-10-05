import multer from 'multer';
import path from 'path';

// הגדרת מקום השמירה ושמות הקבצים
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // שומר בתיקייה שנקראת uploads
    },
    filename: (req, file, cb) => {
        // יוצר שם ייחודי כדי ששני קבצים לא ידרכו אחד על השני
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// מסנן שמוודא שמעלים רק תמונות
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);  // מאפשר את העלאת הקובץ
    } else {
        cb(new Error('Only image files are allowed!'), false); // דחיית הקובץ  
    }
};

// הגדרת המידלוור של Multer
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // מגבלת גודל הקובץ ל-5MB
});