import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

import Uaserrouter from './src/routes/user.routes.js';

app.use('/api/v1/users', Uaserrouter);

import Blogrouter from './src/routes/blog.routes.js';

app.use('/api/v1/blogs', Blogrouter);

export default app;
