import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import indexRoutes from './routes/index.route.js';
import { notFound, errorHandler } from './middlewares/errors.middleware.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { fileURLToPath } from 'node:url';

const app = express();

connectDB();

// npm לבחירתנו
// הוספת כותרות אבטחה להגנה מפני פגיעויות נפוצות ברשת
// הוספת כותרות אבטחה. cross-origin נדרש כדי שהלקוח יוכל להציג תמונות מ-/uploads
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(cors());

app.use(express.static(fileURLToPath(new URL('../client', import.meta.url))));

app.use(express.json());

// הגשת התמונות שהועלו
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api', indexRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(env.PORT, () => {
    console.log(`Server is running on http://localhost:${env.PORT}`)
});