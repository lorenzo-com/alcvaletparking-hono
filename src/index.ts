import { Hono } from 'hono';
import { logger } from 'hono/logger';
import bookings from './routes/bookings';

const app = new Hono();

app.use('*', logger());

app.route('/api/bookings', bookings);

export default app;