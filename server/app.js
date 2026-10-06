import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import indexRoutes from './routes/index.route.js';
import { notFound, errorHandler } from './middlewares/errors.middleware.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

const app = express();

connectDB();

// npm לבחירתנו
// הוספת כותרות אבטחה להגנה מפני פגיעויות נפוצות ברשת
app.use(helmet());

app.use(cors());

app.use(express.json());
