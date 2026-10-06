import express from 'express';
import { connectDB } from './config/db.js';

const app = express();

connectDB();

app.use('/api', indexRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(env.PORT, () => {
    console.log(`Server is running on http://localhost:${env.PORT}`)
});