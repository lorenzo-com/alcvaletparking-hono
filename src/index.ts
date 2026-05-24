import { Hono } from 'hono';
import { logger } from 'hono/logger';
import bookings from './routes/bookings';
import pricing from './routes/pricing';
import { cors } from 'hono/cors';
import { invoices } from './routes/invoices';
import users from './routes/users';
import contracts from './routes/contracts';

const app = new Hono();

// --- CONFIGURACIÓN CORS ---
app.use('*', cors({
    origin: [
        'http://localhost:4321', // Astro en desarrollo
        'http://localhost:5173', // Svelte (Vite) en desarrollo
        'https://www.alcvaletparking.com', // dominio de producción (Astro)
        'https://alcvaletparking.com', // dominio de producción (Astro)
        'https://admin.alcvaletparking.com', // dominio de admin (Svelte)
        'https://alc-valet-parking-astro.pages.dev', // Dominio de cloudflare (Cliente)
    ],
    allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
    allowHeaders: ['Content-Type', 'Authorization', 'apikey', 'X-Client-Info'],
    exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    maxAge: 600, // Cachea la respuesta de pre-flight por 10 minutos
    credentials: true, // IMPORTANTE: Permite enviar cookies o headers de autorización
}))

app.use('*', logger());

app.route('/api/bookings', bookings);
app.route('/api/invoices', invoices);
app.route('/api/pricing', pricing);
app.route('/api/users', users);
app.route('/api/contracts', contracts);

export default app;