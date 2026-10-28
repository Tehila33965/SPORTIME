import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
});

// הקובץ נשמר זמנית בזיכרון ומיד נשלח ל-Cloudinary (לא נכתב לדיסק)
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('סוג הקובץ חייב להיות JPG, PNG, GIF או WEBP'), false);
        }
    },
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

// שליחת הקובץ ל-Cloudinary ושמירת הכתובת המלאה ב-req.body.image
const uploadToCloudinary = (req, res, next) => {
    if (!req.file) return next();

    const stream = cloudinary.uploader.upload_stream(
        { folder: 'sportime' },
        (error, result) => {
            if (error) {
                return next({ status: 500, error, type: 'Upload Error' });
            }
            req.body.image = result.secure_url;
            next();
        }
    );
    stream.end(req.file.buffer);
};

export const uploadImage = [receiveFile, uploadToCloudinary];